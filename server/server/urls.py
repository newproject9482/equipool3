"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views, health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/borrowers/signup', views.borrower_signup, name='borrower-signup'),
    path('api/borrowers/login', views.borrower_login, name='borrower-login'),
    path('api/investors/signup', views.investor_signup, name='investor-signup'),
    path('api/investors/login', views.investor_login, name='investor-login'),
    path('api/auth/logout', views.auth_logout, name='auth-logout'),
    path('api/auth/me', views.auth_me, name='auth-me'),
    path('api/validate/email', views.validate_email, name='validate-email'),
    path('api/pools/create', views.create_pool, name='create-pool'),
    path('api/pools', views.get_pools, name='get-pools'),
    path('api/pools/<int:pool_id>', views.get_pool_detail, name='get-pool-detail'),
    path('api/pools/<int:pool_id>/update', views.update_pool, name='update-pool'),
    path('api/pools/<int:pool_id>/delete', views.delete_pool, name='delete-pool'),
    # Investor endpoints
    path('api/investor/pools', views.get_investment_opportunities, name='get-investment-opportunities'),
    path('api/investor/pools/<int:pool_id>', views.get_investment_pool_detail, name='get-investment-pool-detail'),
    path('api/investor/pools/<int:pool_id>/invest', views.invest_in_pool, name='invest-in-pool'),
    path('api/investor/investments', views.get_my_investments, name='get-my-investments'),
    path('api/investor/dashboard', views.get_investor_dashboard, name='get-investor-dashboard'),
    # Health check endpoints
    path('api/health/database', health.database_health_check, name='database-health'),
    path('api/health/users', health.list_users, name='list-users'),
    path('api/health/migrate', health.force_migrate, name='force-migrate'),
]
