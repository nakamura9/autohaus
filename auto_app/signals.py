from django.db.models.signals import post_save
from django.dispatch import receiver
from auto_app.models import ContactEntry


@receiver(post_save, sender=ContactEntry)
def email_contact_entry(sender, instance, **kwargs):
    print("Emailing admin to notify of new contact %s" % instance)
    print("Emailing sender to acknowledge receipt of contact")