# Generated by Django 4.1.13 on 2024-02-17 10:16

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('user_id', models.AutoField(primary_key=True, serialize=False)),
                ('full_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('college_name', models.CharField(max_length=225)),
                ('designation', models.CharField(max_length=225)),
                ('community_id', models.SmallIntegerField()),
                ('display_image', models.CharField(max_length=255)),
                ('rank', models.CharField(max_length=2)),
                ('password', models.CharField(max_length=225)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user_role', models.CharField(max_length=2)),
                ('mentor_id_card', models.ImageField(blank=True, null=True, upload_to='uploads/mentor_id')),
                ('report_count', models.SmallIntegerField(default=0)),
                ('verification_code', models.CharField(max_length=5)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Community',
            fields=[
                ('community_id', models.AutoField(primary_key=True, serialize=False)),
                ('community_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('conversation_id', models.AutoField(primary_key=True, serialize=False)),
                ('from_user', models.IntegerField()),
                ('to_user', models.IntegerField()),
                ('approval_status', models.CharField(max_length=100)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('community_id', models.SmallIntegerField()),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Messages',
            fields=[
                ('message_id', models.AutoField(primary_key=True, serialize=False)),
                ('conversation_id', models.SmallIntegerField()),
                ('content', models.CharField(max_length=255)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('community_id', models.SmallIntegerField()),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notified_user', models.IntegerField()),
                ('message', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('question_id', models.AutoField(primary_key=True, serialize=False)),
                ('question_content', models.CharField(max_length=255)),
                ('question_user', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('subject', models.CharField(max_length=200)),
                ('report_count', models.SmallIntegerField(default=0)),
                ('community_id', models.SmallIntegerField()),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('answer_id', models.AutoField(primary_key=True, serialize=False)),
                ('question_id', models.IntegerField()),
                ('answer_content', models.CharField(max_length=255)),
                ('answer_user', models.IntegerField()),
                ('upvotes', models.IntegerField(default=0)),
                ('downvotes', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('report_count', models.SmallIntegerField(default=0)),
                ('community_id', models.SmallIntegerField()),
                ('is_active', models.BooleanField(default=True)),
                ('disliked_by', models.ManyToManyField(blank=True, related_name='user_disliked', to=settings.AUTH_USER_MODEL)),
                ('liked_by', models.ManyToManyField(blank=True, related_name='user_liked', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
