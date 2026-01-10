from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from .models import Profile, Follow, Like, Notification, Comment


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


# ---------------- FOLLOW ---------------- #

@receiver(post_save, sender=Follow)
def increase_counts(sender, instance, created, **kwargs):
    if created:
        instance.follower.profile.following_count += 1
        instance.follower.profile.save()

        instance.following.profile.followers_count += 1
        instance.following.profile.save()


@receiver(post_delete, sender=Follow)
def decrease_counts(sender, instance, **kwargs):
    instance.follower.profile.following_count -= 1
    instance.follower.profile.save()

    instance.following.profile.followers_count -= 1
    instance.following.profile.save()


@receiver(post_save, sender=Follow)
def notify_follow(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            actor=instance.follower,
            recipient=instance.following,
            type="follow",
            target=instance
        )


# ---------------- LIKE ---------------- #

@receiver(post_save, sender=Like)
def notify_like(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.user:
        Notification.objects.create(
            actor=instance.user,
            recipient=instance.post.user,
            type="like",
            target=instance.post  
        )


# ---------------- COMMENT ---------------- #



@receiver(post_save, sender=Comment)
def notify_comment(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.user:
        Notification.objects.create(
            actor=instance.user,
            recipient=instance.post.user,
            type="comment",
            target=instance   # 🔥 TARGET IS COMMENT, NOT POST
        )

