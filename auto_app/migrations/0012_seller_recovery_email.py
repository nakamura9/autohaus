# Generated by Django 5.1.3 on 2025-01-01 12:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auto_app', '0011_contactentry'),
    ]

    operations = [
        migrations.AddField(
            model_name='seller',
            name='recovery_email',
            field=models.EmailField(blank=True, default='', max_length=254),
        ),
    ]
