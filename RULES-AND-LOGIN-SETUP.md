# প্রোডাকশন-রেডি Firebase Rules + অ্যাডমিন লগইন সেটআপ

`admin.html` এখন লগইন-গেটেড — ইমেইল/পাসওয়ার্ড দিয়ে সাইন-ইন না করলে
অ্যাডমিন প্যানেলের কিছুই দেখা যাবে না। নিচের ৩টা ধাপ ফায়ারবেইজ কনসোলে
করলেই সাইট প্রোডাকশনের জন্য নিরাপদ হয়ে যাবে।

## ধাপ ১ — Email/Password লগইন চালু করো

1. বাম মেনু থেকে **Authentication → Sign-in method**
2. **Email/Password** প্রোভাইডার চালু (Enable) করো
3. **Authentication → Users** ট্যাবে গিয়ে **Add user** চাপো
4. তোমার ইমেইল আর একটা শক্তিশালী পাসওয়ার্ড দাও — এটাই এখন থেকে
   `admin.html` এ লগইন করার তথ্য

## ধাপ ২ — Firestore Rules বদলাও

**Firestore Database → Rules** ট্যাবে গিয়ে বর্তমান কোডটা মুছে নিচেরটা বসাও,
তারপর **Publish** চাপো:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null;
    }

    // পেইজ ও কনফিগ (মেনু/সেটিংস) — সবাই পড়তে পারবে, শুধু লগইন করা অ্যাডমিন লিখতে পারবে
    match /pages/{pageId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /config/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // পোস্ট — সবাই পড়তে পারবে; অ্যাডমিন সব লিখতে পারবে;
    // যে কেউ শুধু "likes" সংখ্যা বদলে লাইক দিতে পারবে (বাকি ফিল্ড ছোঁয়া যাবে না)
    match /posts/{postId} {
      allow read: if true;
      allow create, delete: if isAdmin();
      allow update: if isAdmin()
        || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes']);
    }

    // কমেন্ট — সবাই পড়তে ও নতুন কমেন্ট লিখতে পারবে, শুধু অ্যাডমিন মুছতে পারবে
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['postId','name','text','date'])
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0 && request.resource.data.name.size() < 60
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0 && request.resource.data.text.size() < 1000;
      allow update: if false;
      allow delete: if isAdmin();
    }

    // মিডিয়া লাইব্রেরি — সবাই পড়তে পারবে, শুধু অ্যাডমিন আপলোড/মুছতে পারবে
    match /media/{mediaId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## ধাপ ৩ — Storage Rules বদলাও

**Storage → Rules** ট্যাবে গিয়ে একইভাবে বসাও:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```

## এরপর কী হবে

- সাইটের সব পাবলিক পেইজ (হোম, গল্প, বিজ্ঞান, পোস্ট পড়া, লাইক দেওয়া, কমেন্ট
  করা) আগের মতোই কাজ করবে — লগইন ছাড়াই।
- `admin.html` খুললে এখন প্রথমে একটা লগইন স্ক্রিন আসবে। ধাপ ১-এ বানানো
  ইমেইল/পাসওয়ার্ড দিয়ে ঢুকলে তবেই ড্যাশবোর্ড দেখা যাবে।
- সাইডবারের নিচে **🚪 লগআউট** বাটন দিয়ে লগআউট করা যাবে।
- অন্য কেউ যদি জোর করে ডেটা মুছতে বা বদলাতে চেষ্টা করে (এমনকি ব্রাউজার
  কনসোল থেকেও), Firestore/Storage রুলস সেটা আটকে দেবে, কারণ সে লগইন করা
  নেই।

## মনে রাখার বিষয়

- একাধিক অ্যাডমিন প্রয়োজন হলে **Authentication → Users** থেকে আরও ইউজার
  যোগ করা যায় — সবাই একই অনুমতি পাবে (এই সহজ মডেলে সব লগইন করা ইউজারই
  "অ্যাডমিন")।
- পাসওয়ার্ড ভুলে গেলে Firebase কনসোল থেকেই Users ট্যাবে গিয়ে রিসেট করা
  যায়।
