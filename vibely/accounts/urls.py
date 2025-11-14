from rest_framework.routers import DefaultRouter
from .views import UserViewSet 
from .views import (
    FollowToggleView,
    FollowersListView,
    FollowingListView
)
from .views import RecentChatsView, ToggleLikeView, PostCommentsView, CommentDeleteView
from .views import RegisterView, MeView, ProfileView, PostViewSet, MyPostsView, MessageListCreateView, UserProfilePostsView
from django.urls import path

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(),name='me'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('my-posts/', MyPostsView.as_view(), name='my-posts'),
    path('messages/', MessageListCreateView.as_view(), name='messages'),
    path('user/<int:user_id>/', UserProfilePostsView.as_view(), name='user-profile-posts'),
    path('recent-chats/', RecentChatsView.as_view(), name='recent-chats'),
     path("posts/<int:post_id>/like/", ToggleLikeView.as_view(), name="toggle-like"),
       path("posts/<int:post_id>/comments/", PostCommentsView.as_view(), name="post-comments"),
    path("comments/<int:pk>/", CommentDeleteView.as_view(), name="comment-delete"),
     path("profiles/<str:username>/follow/", FollowToggleView.as_view()),
    path("profiles/<str:username>/followers/", FollowersListView.as_view()),
    path("profiles/<str:username>/following/", FollowingListView.as_view()),


    
    
    
    
    
]

urlpatterns += router.urls
