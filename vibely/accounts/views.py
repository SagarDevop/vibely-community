from rest_framework import viewsets, permissions
from .models import User, Post, Message, Like, Comment, Follow
from django.db.models import Q
from .serializers import UserSerializer, ProfileSerializer, PostSerializer, MessageSerializer, RecentChatUserSerializer, CommentSerializer
from rest_framework import generics
from django.shortcuts import get_object_or_404

from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


    
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile
    

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        

class MyPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(user=self.request.user).order_by('-created_at')
    
class UserProfilePostsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        profile_serializer = ProfileSerializer(user.profile, context={'request': request})
        posts_queryset = Post.objects.filter(user=user).order_by('-created_at')
        posts_serializer = PostSerializer(posts_queryset, many=True, context={'request': request})

        return Response({
    "profile": {
        "id": user.id,  
        **profile_serializer.data
    },
    "posts": posts_serializer.data
})


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.request.query_params.get('user')
        if other_user_id:
            return Message.objects.filter(
                Q(sender=user, receiver_id=other_user_id) |
                Q(sender_id=other_user_id, receiver=user)
            ).order_by('timestamp')
        return Message.objects.none()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
        
class RecentChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        messages = Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('-timestamp')

        other_user_ids = []
        for msg in messages:
            other = msg.sender if msg.sender != user else msg.receiver
            if other.id not in other_user_ids:
                other_user_ids.append(other.id)

        users = User.objects.filter(id__in=other_user_ids)
        serializer = RecentChatUserSerializer(users, many=True)
        return Response(serializer.data)
    

class ToggleLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        user = request.user

        like, created = Like.objects.get_or_create(user=user, post=post)
        if not created:
            # Already liked —> unlike
            like.delete()
            return Response({"liked": False, "like_count": post.likes.count()})
        
        return Response({"liked": True, "like_count": post.likes.count()})
    

class PostCommentsView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs["post_id"]
        return Comment.objects.filter(post_id=post_id, parent=None).order_by("-created_at")

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs["post_id"])
        serializer.save(user=self.request.user, post=post)
        
class CommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own comments.")
        instance.delete()

class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target = get_object_or_404(User, username=username)

        if target == request.user:
            return Response({"error": "You cannot follow yourself."}, status=400)

        follow_obj, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target
        )

        if created:
            return Response({"status": "followed"})
        else:
            follow_obj.delete()
            return Response({"status": "unfollowed"})
        
class FollowersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followers = user.followers_set.all().select_related("follower")

        data = [
            {
                "id": f.follower.id,
                "username": f.follower.username
            }
            for f in followers
        ]
        return Response(data)

class FollowingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        following = user.following_set.all().select_related("following")

        data = [
            {
                "id": f.following.id,
                "username": f.following.username
            }
            for f in following
        ]
        return Response(data)
