# Generated by Django 5.1.3 on 2025-02-08 07:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auto_app', '0016_savedsearch'),
    ]

    operations = [
        migrations.AddField(
            model_name='vehiclephoto',
            name='cdn_photo',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='vehiclephoto',
            name='cdn_thumbnail',
            field=models.URLField(blank=True, null=True),
        ),
    ]
