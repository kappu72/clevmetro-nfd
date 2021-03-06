# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-02-28 15:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nfdcore', '0034_taxon_leap_concern'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='slimemoldlifestages',
            name='code',
        ),
        migrations.RemoveField(
            model_name='slimemoldlifestages',
            name='name',
        ),
        migrations.AddField(
            model_name='slimemoldlifestages',
            name='sclerotium_color',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='slimemoldlifestages',
            name='sclerotium_size',
            field=models.FloatField(blank=True, default=0.0, null=True),
        ),
        migrations.AddField(
            model_name='slimemoldlifestages',
            name='sporangia_color',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='slimemoldlifestages',
            name='sporangia_size',
            field=models.FloatField(blank=True, default=0.0, null=True),
        ),
        migrations.AddField(
            model_name='slimemoldlifestages',
            name='streaming_body_color',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='slimemoldlifestages',
            name='streaming_body_size',
            field=models.FloatField(blank=True, default=0.0, null=True),
        ),
    ]
