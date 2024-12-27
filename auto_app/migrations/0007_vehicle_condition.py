# Generated by Django 5.1.3 on 2024-12-08 19:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auto_app', '0006_city'),
    ]

    operations = [
        migrations.AddField(
            model_name='vehicle',
            name='condition',
            field=models.CharField(choices=[('Non-Runner', 'Non-Runner'), ('Excellent', 'Excellent'), ('Good', 'Good'), ('Fair', 'Fair'), ('New', 'New'), ('Needs Work', 'Needs Work')], default='Good', max_length=50),
        ),
    ]