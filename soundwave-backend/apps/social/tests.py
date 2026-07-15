# TODO(Rayan): minimum tests for this app:
# - follow then follow-stats reflects follower_count + is_following=True
# - unfollow removes the row and follow-stats updates
# - a user cannot follow themselves (409/400)
# - following the same user twice is idempotent (no duplicate row / 400)
