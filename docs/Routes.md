# Routes

## Doctor

## BecomeDoctor
There is 3 types of users: simple user, doctor & admin. Simple user has instant signup. To become doctor user need to send request and if it acceped doctor will have access to his account. ``api/doctor-request/*`` route is used to manage this doctor requests

### POST api/doctor-request/send

Used to send BecomeUserRequest

**REQUEST:** DoctorRequest

**RESPONSE:** 
```javascript

{
    // is operation goind success
    success: boolean; 

    // what error happened. Only if success is false
    error?: 
    | "no_body_found" // body is empty
    | "request_limit_request" // 3 applications with the same email address have already been submitted for consideration
    | "invalid_error" // invalid error happened 

    // Error description
    message?: string;  
}

```