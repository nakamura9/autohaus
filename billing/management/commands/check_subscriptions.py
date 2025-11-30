"""
Management command to check subscription expiry and send reminders.

This command should be run daily via cron:
    0 6 * * * python manage.py check_subscriptions

Features:
- Marks expired subscriptions as 'expired'
- Revokes CMS access for expired users
- Sends email reminders at 7, 3, and 1 days before expiry
"""

from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from billing.models import Subscription
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Check subscription expiry and send reminders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making changes or sending emails',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Print detailed output',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        verbose = options['verbose']
        today = date.today()

        if verbose:
            self.stdout.write(f"Running subscription check for {today}")
            if dry_run:
                self.stdout.write(self.style.WARNING("DRY RUN - no changes will be made"))

        # Get all active subscriptions
        active_subs = Subscription.objects.filter(status='active')

        expired_count = 0
        reminder_7_count = 0
        reminder_3_count = 0
        reminder_1_count = 0

        for sub in active_subs:
            if not sub.expires_at:
                if verbose:
                    self.stdout.write(f"  Skipping {sub.user.email} - no expiry date")
                continue

            days_left = (sub.expires_at - today).days

            if days_left <= 0:
                # Subscription has expired
                if verbose:
                    self.stdout.write(f"  EXPIRED: {sub.user.email} (expired {-days_left} days ago)")

                if not dry_run:
                    self.expire_subscription(sub)
                expired_count += 1

            elif days_left == 7:
                if verbose:
                    self.stdout.write(f"  REMINDER (7 days): {sub.user.email}")

                if not dry_run:
                    self.send_reminder(sub, days_left)
                reminder_7_count += 1

            elif days_left == 3:
                if verbose:
                    self.stdout.write(f"  REMINDER (3 days): {sub.user.email}")

                if not dry_run:
                    self.send_reminder(sub, days_left)
                reminder_3_count += 1

            elif days_left == 1:
                if verbose:
                    self.stdout.write(f"  REMINDER (1 day): {sub.user.email}")

                if not dry_run:
                    self.send_reminder(sub, days_left)
                reminder_1_count += 1

        # Summary
        self.stdout.write(self.style.SUCCESS(f"\nSubscription Check Complete:"))
        self.stdout.write(f"  - Expired: {expired_count}")
        self.stdout.write(f"  - 7-day reminders: {reminder_7_count}")
        self.stdout.write(f"  - 3-day reminders: {reminder_3_count}")
        self.stdout.write(f"  - 1-day reminders: {reminder_1_count}")

    def expire_subscription(self, sub):
        """Mark subscription as expired and revoke CMS access"""
        try:
            # Mark subscription as expired
            sub.status = 'expired'
            sub.save()

            # Revoke CMS access
            if hasattr(sub.user, 'seller'):
                seller = sub.user.seller
                seller.is_cms_user = False
                seller.save()

            # Send expiry notification
            self.send_expiry_notification(sub)

            logger.info(f"Subscription expired for {sub.user.email}")

        except Exception as e:
            logger.error(f"Failed to expire subscription {sub.id}: {str(e)}")
            self.stdout.write(self.style.ERROR(f"Error expiring {sub.user.email}: {str(e)}"))

    def send_reminder(self, sub, days_left):
        """Send subscription expiry reminder email"""
        try:
            subject = f"Your subscription expires in {days_left} day{'s' if days_left > 1 else ''}"

            message = f"""
Hello {sub.user.first_name or sub.user.username},

Your {sub.plan.name} subscription will expire in {days_left} day{'s' if days_left > 1 else ''} on {sub.expires_at}.

To continue using our CMS and selling vehicles on the platform, please renew your subscription before it expires.

Visit your account page to renew: https://auto.bench.co.zw/account/subscriptions

Thank you for using our platform!

Best regards,
The Autohaus Team
"""

            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@auto.bench.co.zw'),
                recipient_list=[sub.user.email],
                fail_silently=True,
            )

            logger.info(f"Sent {days_left}-day reminder to {sub.user.email}")

        except Exception as e:
            logger.error(f"Failed to send reminder to {sub.user.email}: {str(e)}")

    def send_expiry_notification(self, sub):
        """Send notification that subscription has expired"""
        try:
            subject = "Your subscription has expired"

            message = f"""
Hello {sub.user.first_name or sub.user.username},

Your {sub.plan.name} subscription has expired as of {sub.expires_at}.

Your existing listings will remain visible on the platform, but you will no longer be able to:
- Create new vehicle listings
- Edit existing listings
- Access the CMS dashboard

To regain access, please renew your subscription at: https://auto.bench.co.zw/account/subscriptions

Thank you for using our platform!

Best regards,
The Autohaus Team
"""

            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@auto.bench.co.zw'),
                recipient_list=[sub.user.email],
                fail_silently=True,
            )

            logger.info(f"Sent expiry notification to {sub.user.email}")

        except Exception as e:
            logger.error(f"Failed to send expiry notification to {sub.user.email}: {str(e)}")
