from rest_framework import serializers
from .models import User, Profile, Post, Message, Comment
from django.contrib.auth.hashers import make_password

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Profile
        fields = ['username', 'name','avatar', 'bio', 'website', 'is_private', 'created_at', 'followers_count', 'following_count']
        
    
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
    class Meta:
        model = User
        fields = ['id', 'username']
    
    
    
    
class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    replies = RecursiveField(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "text", "parent", "replies", "created_at"]