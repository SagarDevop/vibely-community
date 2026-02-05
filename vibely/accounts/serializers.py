from rest_framework import serializers
from .models import User, Profile, Post, Message, Comment, Notification
from django.contrib.auth.hashers import make_password

class ProfileSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Profile
        fields = ['username', 'name','avatar', 'bio', 'website', 'is_private', 'created_at', 'followers_count', 'following_count', 'is_following']
    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        
        # obj.user = actual User object behind profile
        return obj.user.followers_set.filter(follower=request.user).exists()

    
class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.profile.avatar', read_only=True)
    comment_count = serializers.IntegerField(source="comments.count", read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'image', 'caption', 'created_at', 'user', 'username', 'like_count', 'is_liked','avatar','comment_count'] 
        read_only_fields = ['id', 'created_at', 'user', 'username, avatar']
        
    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    profile = ProfileSerializer(read_only=True)
    post = PostSerializer(many=True, read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email','password','profile', 'post']
        
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender']


class RecentChatUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'profile']
    
    
    
    
class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_avatar = serializers.SerializerMethodField()
    replies = RecursiveField(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "user_avatar",
            "text",
            "parent",
            "replies",
            "created_at",
        ]

    def get_user_avatar(self, obj):
        profile = getattr(obj.user, "profile", None)
        if profile and profile.avatar:
            return profile.avatar.url
        return None


from rest_framework import serializers

class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)
    actor_avatar = serializers.ImageField(source="actor.profile.avatar", read_only=True)

    post_id = serializers.SerializerMethodField()
    post_image = serializers.SerializerMethodField()
    comment_text = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "actor_username",
            "actor_avatar",
            "actor_id",
            "post_id",
            "post_image",
            "comment_text",
            "is_read",
            "created_at",
        ]

    def get_post_id(self, obj):
        if isinstance(obj.target, Post):
            return obj.target.id
        if isinstance(obj.target, Comment):
            return obj.target.post.id
        return None

    def get_post_image(self, obj):
        if isinstance(obj.target, Post):
            return obj.target.image.url if obj.target.image else None
        if isinstance(obj.target, Comment):
            post = obj.target.post
            return post.image.url if post.image else None
        return None

    def get_comment_text(self, obj):
        if isinstance(obj.target, Comment):
            return obj.target.text
        return None


