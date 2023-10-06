# Flow of tests

## 1. Create Dummy Users
    1.1. Create User (emailduplicate)
    1.2. Create User (usernameduplicate)

## 2. Create a User (user1)
    2.1. Fail to create a user with the same email
    2.2. Fail to create a user with the same username
    2.3. Success to create a user with a unique email and username

## 3. Login with the User
    3.1. Fail to log in with an unverified account

## 4. Get Unique String from Database

## 5. Verify Account Using Email (get directly from db)
    5.1. Fail to verify an account with the wrong unique string
    5.2. Success to verify an account with the correct unique string
    5.3. Fail to verify an account with an already verified account

## 6. Login with the User (user1)
    6.1. Fail to log in with the wrong password
    6.2. Fail to log in with the wrong email
    6.3. Success to log in with the correct credentials and verified account

## 7. Forgot Password Call
    7.1. Fail to send an email with the wrong email
    7.2. Success to send an email with the correct email

## 8. Get Unique String from Database

## 9. Check for Valid String or Not (get unique string from db)
    9.1. Fail in a valid string with the wrong unique string
    9.2. Fail in a valid string with the old unique string
    9.3. Success in a valid string with the correct unique string

## 10. Reset Password
    10.1. Fail to reset the password with the wrong unique string
    10.2. Fail to reset the password with the old unique string
    10.3. Success to reset the password with the correct unique string

## 11. Login with New Password
    11.1. Fail to log in with the old password
    11.2. Success to log in with the new password
    11.3. Store token (token1) for future use

## 12. Create a Project
    12.1. Success to create a project with valid data
    12.2. Store project id (project1) for future use
    12.3. Fail to review own project
    12.4. Get project by id (project1)

## 13. Logout (not required to be done in testing)

## 14. Sign Up with Another User (user2)
    14.1. Success to create a user with a unique email and username
    14.2. Verify account using email (get directly from db)

## 15. Login with User2

## 16. Review (review1) on project1
    16.1. Success to create a review
    16.2. Success to update a review

## 17. Engage with project1
    17.1. Like project1
    17.2. Dislike project1

## 18. Engage with review1
    18.1. Upvote Review1
    18.2. Downvote Review1
    18.3. Comment on review1

## 19. Logout (not required to be done in testing)

## 20. Login with User1

## 21. Rate Review1

## 22. Update User Profile
    22.1. Update User Profile Picture
    22.2. Update User Profile Bio

## 23. Get Users
    23.1. Get Top Users
    23.2. Get User by Username (user2)

## 24. Clean Up
    24.1. Delete review1
    24.2. Delete project1
    24.3. Delete user1
    24.4. Delete user2
    24.5. Delete user (emailduplicate)
    24.6. Delete user (usernameduplicate)

## 25. Miscellaneous Tests
    25.1. Get all projects
    25.2. Upload a test file
    25.3. Delete a test file
    25.4. Search projects by technology

## End of Tests
