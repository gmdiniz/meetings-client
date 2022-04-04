# Generated by Django 4.0.3 on 2022-03-06 17:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videoconf', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='meeting',
            name='participants',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='end_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='metadata',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='moderators',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='permissions',
            field=models.JSONField(blank=True, default=list),
        ),
    ]