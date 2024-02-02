from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.crypto import get_random_string

class UserProfileManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        return self.create_user(email, full_name, password, **extra_fields)

class UserProfile(AbstractBaseUser):
    user_id =       models.AutoField(primary_key=True)
    full_name =     models.CharField(max_length=100)
    email =         models.EmailField(unique=True)
    college_name =  models.CharField(max_length=225)
    designation =  models.CharField(max_length=225) 
    community_id =  models.SmallIntegerField()      #1:BBA 2:BCA, 3:BCom, 4:BCom Hons   
    display_image = models.CharField(max_length=255)            #image url
    rank =          models.CharField(max_length=2)              #1:gold, 2:silver, 3:bronze
    password =      models.CharField(max_length=225)
    created_at =    models.DateTimeField(auto_now_add=True)     #timestamp
    user_role =     models.CharField(max_length=2)    #0:!verified_mentor 1:verified_mentor 2:student
    mentor_id_card = models.ImageField(upload_to='uploads/mentor_id', null=True, blank=True) #image path
    report_count=   models.SmallIntegerField(default=0)

    # Custom fields for Django User model
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserProfileManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']


    def __str__(self):
        return self.email
    
    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return self.is_staff

class Community(models.Model):
    community_id = models.SmallIntegerField(primary_key=True)  
    community_name = models.CharField(max_length=100)

    def __str__(self):
        return self.community_name

class Question(models.Model):
    question_id= models.AutoField(primary_key=True) 
    question_content= models.CharField(max_length=255)
    question_user= models.IntegerField()  
    created_at= models.DateTimeField(auto_now_add=True)
    subject= models.CharField(max_length=200)
    report_count= models.SmallIntegerField(default=0)
    community_id= models.SmallIntegerField()  

    def __str__(self):
        return self.question_id
    
class Answer(models.Model):
    answer_id= models.AutoField(primary_key=True)
    question_id= models.IntegerField()  
    answer_content= models.CharField(max_length=255)
    answer_user= models.IntegerField()
    upvotes= models.IntegerField()
    downvotes= models.IntegerField()
    created_at= models.DateTimeField(auto_now_add=True)
    report_count= models.SmallIntegerField()
    community_id= models.SmallIntegerField()  

    def __str__(self):
        return self.answer_id

class Conversation(models.Model):
    conversation_id= models.AutoField(primary_key=True)
    from_user= models.IntegerField()
    to_user= models.IntegerField()
    approval_status= models.CharField(max_length=100)
    timestamp= models.DateTimeField(auto_now_add=True)
    community_id= models.SmallIntegerField() 

    def __str__(self):
        return self.conversation_id 

class Messages(models.Model):
    message_id= models.AutoField(primary_key=True)
    conversation_id= models.SmallIntegerField()
    content= models.CharField(max_length=255)
    timestamp= models.DateTimeField(auto_now_add=True)
    community_id= models.SmallIntegerField()  

    def __str__(self):
        return self.message_id