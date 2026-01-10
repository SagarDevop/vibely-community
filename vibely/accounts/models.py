from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# Create your models here.

class User(AbstractUser):
    email = models.EmailField()

class Profile(models.Model):
    followers_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)  
    name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    website = models.URLField(blank=True)
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
    

class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name='post')
    image = models.ImageField(upload_to="posts/")
    caption = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return  f"{self.user.username}'s post - {self.caption[:10]}"
    
    
class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages")
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username}: {self.text[:30]}"
    
    
class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")

    def __str__(self):
        return f"{self.user.username} liked {self.post.id}"
    


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.text[:20]}"

    @property
    def is_reply(self):
        return self.parent is not None
    
    
class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="following_set"
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="followers_set"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} -> {self.following.username}"
    
    
    
class Notification(models.Model):
    NOTIF_TYPES = (
        ("like", "Like"),
        ("comment", "Comment"),
        ("follow", "Follow"),
    )

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="actor_notifications"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )

    type = models.CharField(max_length=20, choices=NOTIF_TYPES)

    target_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    target_object_id = models.PositiveIntegerField()
    target = GenericForeignKey("target_content_type", "target_object_id")
    

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actor} → {self.recipient} ({self.type})"