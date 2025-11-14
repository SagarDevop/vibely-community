from django.conf import settings
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Profile, Follow

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        
        
        
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