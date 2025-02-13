import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Fix: Now __dirname is defined, and this will work
app.use(express.static(path.join(__dirname, "public")));


const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const API_URL = "https://api.perplexity.ai/chat/completions";

const port = 3000;
const saltRounds = 10;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const postsDir = path.join(__dirname, "public/posts");
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Add session middleware BEFORE your routes
app.use(session({
  secret: 'your-secret-key', // Change this to a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files from the "public" folder

app.use(passport.initialize());
app.use(passport.session());

// Set the view engine to EJS and set the views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user_id) {
    next();
  } else {
    res.redirect('/');
  }
};

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ROUTES

//-------------------------------------------------- Log in route -----------------------------------------------------------------------
app.get("/", (req, res) => {
  // Render the login page without any error messages initially
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const loginPassword = req.body.password;

  try {
    // First, check if the user exists in the 'users' table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !users) {
      return res.send("User not found");
    }

    const storedHashedPassword = users.password_hash;
    // Verify the password
    bcrypt.compare(loginPassword, storedHashedPassword, async (err, result) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).send("Internal server error");
      }

      if (!result) {
        return res.send("Incorrect Password");
      }

      req.session.user_id = users.user_id;
      req.session.username = username;

      return res.redirect("/main");
      
    });
  } catch (err) {
    console.error("Error during login process:", err);
    return res.status(500).send("Internal server error");
  }
});

// -------------------------------------------------- AI Chatbot Route --------------------------------------------------
app.get("/chat", (req, res) => {
  res.render("chat.ejs"); // Renders chat.ejs from the views directory
});

app.post("/chat", async (req, res) => {
  try {
      const { message, context } = req.body;

      const prompt = `
          User's Learning Objective: ${context.programmingObjective}
          User's Skill Level: ${context.skillLevel}
          User's Preferred Timeframe: ${context.timeframe} weeks

          Based on this, recommend the best programming courses and create a structured learning timeline.
      `;

      const response = await axios.post(
          API_URL,
          {
              model: "sonar-pro",
              messages: [
                  { role: "system", content: "You are a helpful AI that suggests learning paths based on user goals." },
                  { role: "user", content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 300
          },
          {
              headers: {
                  "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                  "Content-Type": "application/json"
              }
          }
      );

      const botReply = response.data.choices?.[0]?.message?.content || "No response from AI";
      console.log("\n🤖 Chatbot Response:\n", botReply, "\n");

      res.json({ reply: botReply });

  } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || error.message });
  }
});


// --------------------------------------------------------- Sign up route ---------------------------------------------------------
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      res.send("Username or email is already in use. Please try again.");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const { data, error } = await supabase
            .from('users')
            .insert([
              { username, email, password_hash: hash }
            ]);

          if (error) {
            console.error("Error inserting user:", error);
            return res.status(500).send("Error registering user.");
          }
          
          const { data: user, error: er } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

          if (er) {
            throw er;
          } 

          req.session.user_id = user.user_id;
          req.session.username = user.username;
          return res.status(201).json({ user_id: user.user_id});
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred. Please try again.");
  }
});




// --------------------------------------------------------- Setup profile route --------------------------------------------------------
app.get('/setup-profile/:user_id', isAuthenticated, (req, res) => {
  const username = req.session.username;
  
  // You can pass user data or other required information here
  res.render('setup-profile.ejs', { username });
});

app.put('/setup-profile/:user_id', isAuthenticated, upload.single('pictureFile'), async (req, res) => {
  const { height, weight, targetWeight, birthday} = req.body;
  const imageFile = req.file; // Get the uploaded image file

  try {
    let imageUrl = null;

    // Check if an image was uploaded
    if (imageFile) {
      // Upload image to Supabase storage
      const fileName = `${Date.now()}-${imageFile.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(`profiles/${fileName}`, imageFile.buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.mimetype,
        });

      if (uploadError) {
        console.error("Error uploading image to Supabase:", uploadError);
        return res.status(500).send("Error uploading image.");
      }

      // Get the public URL of the uploaded image
      imageUrl = supabase.storage.from("images").getPublicUrl(`profiles/${fileName}`).data.publicUrl;
    }

    // Update user profile in Supabase
    const { error } = await supabase
      .from('users')
      .update({ height, weight, birthday, target_weight: targetWeight, profile_picture: imageUrl })
      .eq('user_id', req.session.user_id);

    if (error) {
      console.error("Error updating profile:", error);
      return res.status(500).send("Error updating profile. Please try again.");
    }

    res.status(200).send("Profile set up successfully.");
  } catch (err) {
    console.error("An error occurred while setting up the profile:", err);
    res.status(500).send("An error occurred. Please try again.");
  }
});

// Main page route
app.get("/main", isAuthenticated, async (req, res) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      res.status(500).send("An error occurred. Please try again.");
    } else {
      res.render("main.ejs", { posts });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("An error occurred. Please try again.");
  }
});

app.post("/addPost", isAuthenticated, upload.single("recipeImage"), async (req, res) => {
  const { title, description, category } = req.body;
  let ingredients = req.body.ingredients;
  const quantity = req.body.quantity;
  const user_id = req.session.user_id;
  const imageFile = req.file;
  const calories = req.body.calories;

  try {
    let imageUrl = null;

    if (imageFile) {
      // Upload image to Supabase storage
      const fileName = `${Date.now()}-${imageFile.originalname}`;
      const { data, error } = await supabase.storage
        .from("images") // Use your bucket name
        .upload(`posts/${fileName}`, imageFile.buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.mimetype,
        });

      if (error) {
        console.error("Error uploading image to Supabase:", error);
        return res.status(500).send("Error uploading image.");
      }

      // Get public URL of the uploaded image
      imageUrl = supabase.storage.from("images").getPublicUrl(`posts/${fileName}`).data.publicUrl;
    }

    // Insert post data with image URL into database
    const { data: post, error: dbError } = await supabase
      .from("posts")
      .insert([
        {
          user_id,
          title,
          description,
          category,
          ingredients,
          image: imageUrl,
          calories,
        },
      ]);
    
    if (dbError) {
      console.error("Error saving post to database:", dbError);
      res.status(500).send("Error adding post. Please try again.")
    } else {
      return res.status(201).json({ user_id : user_id});
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("An error occurred. Please try again.");
  }
});

//  --------------------------------------------------------- Post route ---------------------------------------------------------
//-----Create a new route to handle individual post details and render them in a new EJS view.--//
app.get('/post/:id', isAuthenticated, async (req, res) => {
    const postId = req.params.id;
    
    // Fetch post information
    try {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
  
      if (postError || !post) {
        console.error("Error fetching post data:", postError);
        return res.status(404).send('Post not found');
      }
  
      // Generate signed URL for the image if there is an image associated with the post
      if (post.image) {
        const filePath = post.image.replace("https://fozznyfkxkrjkcppphpo.supabase.co/storage/v1/object/public/images/", "");
        const { data: signedUrlData, error: urlError } = await supabase
          .storage
          .from("images")
          .createSignedUrl(filePath, 60 * 60 * 24); // 24-hour expiration
  
        if (urlError) {
          console.error("Error generating signed URL:", urlError);
          post.imageUrl = post.image; // Fallback to the original URL if there's an error
        } else {
          post.imageUrl = signedUrlData.signedUrl;
        }
      }
  
      // Define `user` outside of the try-catch so it's accessible later
      let post_owner;
  
      // Fetch user information
      try {
        const { data: fetchedUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', post.user_id)
          .single();
  
        if (userError || !fetchedUser) {
          console.error("Error fetching user data:", userError);
          return res.redirect('/'); // Redirect if user is not found or there's an error
        }
  
        post_owner = fetchedUser; // Assign fetched user data to `user` variable
      } catch (error) {
        console.error("Error fetching profile data:", error);
        return res.status(500).send("An error occurred while loading the profile page.");
      }
  
      // Define `user` outside of the try-catch so it's accessible later
      let user;
      // Fetch user information
      try {
        const { data: fetchedUser, error: userError } = await supabase  
          .from('users')
          .select('*')
          .eq('user_id', req.session.user_id)
          .single();
  
        if (userError || !fetchedUser) {
          console.error("Error fetching user data:", userError);
          return res.redirect('/'); // Redirect if user is not found or there's an error
        }
  
        user = fetchedUser; // Assign fetched user data to `user` variable
  
        
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
        return res.status(500).send("An error occurred while loading the profile page.");
      }
  
  
      // Parse ingredients and comments if they are stored as JSON strings
      post.ingredients = JSON.parse(post.ingredients || '[]');
      post.comments = post.comments || [];
      const isLiked = post.liked_user_id && post.liked_user_id.includes(user.user_id);
      
      // Check if the post is already saved
      const isSaved = user.saved_post_id && user.saved_post_id.includes(postId);
      console.log(isSaved);
  
      // Render the post details along with the user profile data
      res.render('postDetail.ejs', { post, user, post_owner, isSaved, isLiked, postId});
    } catch (error) {
      console.error("Error fetching post details:", error);
      res.status(500).send("An error occurred. Please try again.");
    }
  });

// User flag post Route (handling POST request for reports)
app.post('/flagPost', isAuthenticated, async (req, res) => {
  const { username, flag_reason, flag_description, postID } = req.body; // Get the flag reason and description from the form

  try {
    // Step 1: Find the user by matching the username from the form submission with the 'username' column in the 'users' table
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('username')  // Retrieve only the username for the matching user
      .eq('username', username) // Match the username from the form
      .single();  // Assuming the username is unique, this will return only one record

    if (userError || !users) {
      return res.status(404).json({ message: "User not found" });
    }

    const owner_username = users.username; // Extract the username from the matched user
    console.log(owner_username);

    // Step 2: Update the user's flag_reason and flag_description columns
    const { error: updateError } = await supabase
      .from('users')
      .update({
        flag_reason: flag_reason, // Set the flag reason
        flag_description: flag_description, // Set the flag description
        flagged_post: postID
      })
      .eq('username', owner_username);  // Use the username to update the correct user's record
      console.log(flag_reason, flag_description, postID);

    if (updateError) {
      console.error("Error updating user:", updateError);
      return res.status(500).json({ message: "Error submitting the report." });
    }

    // Step 3: Return success response
    res.status(200).json({ message: "Report submitted successfully!" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});



//-----------------------------------------------------------------Save Post button---------------------------------------------------//
app.post('/post/:id/save', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const { saved } = req.body;
  const userId = req.session.user_id;

  try {
      // Retrieve the user's current saved posts
      const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('saved_post_id')
          .eq('user_id', userId)
          .single();

      if (fetchError) {
          console.error("Error fetching user data:", fetchError);
          return res.status(500).json({ message: "Error fetching user data." });
      }

      let updatedSavedPostsId = user.saved_post_id || [];

      // Update the saved posts array based on the saved state
      if (saved && !updatedSavedPostsId.includes(postId)) {
          updatedSavedPostsId.push(postId);
      } else if (!saved && updatedSavedPostsId.includes(postId)) {
          updatedSavedPostsId = updatedSavedPostsId.filter(id => id !== postId);
      }

      // Update the user's saved_post_id in the database
      const { error: updateError } = await supabase
          .from('users')
          .update({ saved_post_id: updatedSavedPostsId })
          .eq('user_id', userId);

      if (updateError) {
          console.error("Error updating saved posts:", updateError);
          return res.status(500).json({ message: "An error occurred while updating saved posts." });
      }

      // Only one response is sent back
      return res.status(200).json({ message: saved ? "Post saved successfully." : "Post unsaved successfully." });
      
  } catch (error) {
      console.error("Unexpected error updating saved posts:", error);
      // Handle unexpected errors
      return res.status(500).json({ message: "An unexpected error occurred while updating saved posts." });
  }
});





app.get('/getPosts', async (req, res) => {
  try {
      // Fetch posts from the "posts" table
      const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) {
          console.error('Error fetching posts:', error);
          return res.status(500).send('Server error');
      }

      // Generate signed URLs for images if the bucket is private
      const signedPosts = await Promise.all(posts.map(async (post) => {
          if (post.image) {
              const { data: signedUrlData, error: signedUrlError } = await supabase
                  .storage
                  .from('images') // Replace with your bucket name
                  .createSignedUrl(post.image, 60 * 60 * 24); // Expires in 24 hours

              if (signedUrlError) {
                  console.error("Error generating signed URL:", signedUrlError);
                  post.imageUrl = null;
              } else {
                  post.imageUrl = signedUrlData.signedUrl;
              }
          } else {
              post.imageUrl = null;
          }
          return post;
      }));

      // Respond with the posts in JSON format
      res.json(signedPosts);
  } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).send('Server error');
  }
});


//----------------------------------------------------- end point for like --------------------------------------------------------//
app.post('/post/:id/like', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user_id; // Ensure `userId` is available from session
  const { liked } = req.body;

  try {
      // Fetch the post to get the current likes count, liked users, and post owner
      const { data: post, error: postError } = await supabase
          .from('posts')
          .select('likes, liked_user_id, user_id') // Assuming these columns exist
          .eq('id', postId)
          .single();

      if (postError || !post) return res.status(404).json({ message: 'Post not found' });

      // Update likes count and liked_user_id based on `liked` status
      let updatedLikes = post.likes;
      let likedUsers = post.liked_user_id || [];

      if (liked) {
          // Add user to liked_user_id and increment likes if not already liked
          if (!likedUsers.includes(userId)) {
              likedUsers.push(userId);
              updatedLikes++;

              // Insert a notification if the post is liked and it's not by the post owner
              if (userId !== post.user_id) {
                  const { error: notifError } = await supabase
                      .from('notifications')
                      .insert([{
                          sender_user_id: userId,
                          receiver_user_id: post.user_id,
                          target_post_id: postId,
                          type: 'Like',
                      }]);
                  if (notifError) {
                      console.error('Error creating notification:', notifError);
                  }
              }
          }
      } else {
          // Remove user from liked_user_id and decrement likes if already liked
          likedUsers = likedUsers.filter(id => id !== userId);
          updatedLikes = Math.max(0, updatedLikes - 1);
      }

      // Update the post with the new likes count and liked users
      const { error: updateError } = await supabase
          .from('posts')
          .update({ likes: updatedLikes, liked_user_id: likedUsers })
          .eq('id', postId);

      if (updateError) throw updateError;

      res.status(200).json({ likes: updatedLikes });
  } catch (error) {
      console.error('Error updating like:', error);
      res.status(500).json({ message: 'Failed to update like' });
  }
});


app.post('/post/:id/comment', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  const userId = req.session.user_id; // Assuming user ID is stored in session

  try {
      // Fetch the post data, including the post owner
      const { data: post, error: postError } = await supabase
          .from('posts')
          .select('comments, user_id') // Ensure user_id is selected to get post owner
          .eq('id', postId)
          .single();

      if (postError || !post) {
          console.error("Error fetching post:", postError);
          return res.status(404).send('Post not found');
      }

      // Get the current comments or initialize an empty array
      const comments = post.comments || [];

      // Append the new comment with user data
      const newComment = {
          user: req.session.username || 'Anonymous', // Replace with actual username
          text,
          timestamp: new Date().toISOString(),
      };
      comments.push(newComment);

      // Update the post with the new comments array
      const { error: updateError } = await supabase
          .from('posts')
          .update({ comments })
          .eq('id', postId);

      if (updateError) {
          console.error("Error updating comments:", updateError);
          return res.status(500).json({ error: "Failed to add comment" });
      }

      // Insert a notification for the comment action if the commenter is not the post owner
      if (userId !== post.user_id) {
          const { error: notifError } = await supabase
              .from('notifications')
              .insert([{
                  sender_user_id: userId,
                  receiver_user_id: post.user_id,
                  target_post_id: postId,
                  type: 'Comment',
              }]);
          if (notifError) {
              console.error('Error creating notification:', notifError);
          }
      }

      // Respond with the new comment data
      res.json(newComment);
  } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "An unexpected error occurred" });
  }
});

//--------------------------------------------------------- Settings page route -------------------------------------------------------
app.get('/settings', isAuthenticated, async (req, res) => {
    try {
      // Access the user ID from the session directly
      const user_id = req.session.user_id;
      if (!user_id) {
        return res.redirect('/'); // Redirect if not logged in
      }
  
      // Fetch the user data from Supabase based on user_id
      const { data: user, error } = await supabase
        .from('users')
        .select('email')
        .eq('user_id', user_id)
        .single();
  
      if (error || !user) {
        return res.status(500).send("User data not found.");
      }
  
      // Render the settings page, optionally passing current email or other user info if needed
      res.render('settings', { email: user.email });
    } catch (error) {
      console.error("Error loading settings page:", error);
      res.status(500).send("Internal server error.");
    }
  });
  
  // Route to update email
  app.post('/settings/update-email', isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id; // Retrieve user_id from session
    
    if (!user_id) {
      return res.redirect('/'); // Redirect if user is not authenticated
    }
  
    const { currentPassword, email } = req.body;
    console.log("the request body email:", email);
  
    try {
      // Fetch the current user data using the user_id
      const { data: user, error: error } = await supabase
        .from('users')
        .select('email, last_email_change, password_hash')
        .eq('user_id', user_id)
        .single();
  
      if (error || !user) {
        return res.status(500).send("User data not found.");
      }
  
      //verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        console.log("incorrect current password");
        return res.status(401).json({error: "Incorrect current password."});
      }
  
      //check for same email
      if (user.email === email) {
        return res.status(401).json({error: "New email cannot be the same as the current email."});
      }
  
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      const now = new Date();
  
      // Check if one month has passed since the last email change
      const lastEmailChange = user.last_email_change ? new Date(user.last_email_change) : null;
      //debug
      console.log("last email change:", lastEmailChange);
      console.log("now:", now - lastEmailChange);
      if (lastEmailChange && now - lastEmailChange < oneMonth) {
        console.log("last email change is within 1 month");
        return res.status(403).json({error: "You can only change your email once every month."});  
      }
  
      //update email if no error
      console.log("the new email:", email)
      const { error: emailError } = await supabase
        .from('users')
        .update({ email: email })
        .eq('user_id', user_id);
  
      if (emailError) throw emailError;
  
      // Update last_email_change only if the email change is successful
      const { error: lastChangeError } = await supabase
        .from('users')
        .update({ last_email_change: now })
        .eq('user_id', user_id);
  
      if (lastChangeError) throw lastChangeError;
  
      res.status(200).json({ message: "Email updated successfully" });
    } catch (error) {
      console.error("Error updating email:", error);
      res.status(500).send("Internal server error.");
    }
  });
  
  // Route to update password
  app.post('/settings/update-password', isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id; // Retrieve user_id from session
    
    if (!user_id) {
      return res.redirect('/'); // Redirect if user is not authenticated
    }
  
    const { currentPassword, newPassword } = req.body;
  
    try {
      // Retrieve the current hashed password using the user_id
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('user_id', user_id) // Use user_id to fetch the user
        .single();
  
      if (fetchError || !userData) {
        return res.status(500).send("User data not found.");
      }
  
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, userData.password_hash);
      if (!isPasswordValid) {
        return res.status(401).send({error: "Incorrect current password."});
      }
  
      // Check if newPassword is the same as currentPassword
      const isSameAsCurrentPassword = await bcrypt.compare(newPassword, userData.password_hash);
      if (isSameAsCurrentPassword) {
        return res.status(400).json({ error: "New Password cannot be the same as the Current Password. Please choose a different password." });
      }
  
      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const { error: passwordError } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('user_id', user_id);
  
      if (passwordError) throw passwordError;
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).send("Internal server error.");
    }
  });
  
  app.post('/settings/delete-account', isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id;
  
    try {
      // Delete user data from Supabase
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('user_id', user_id);
  
      if (deleteError) throw deleteError;
  
      // Destroy the session and redirect to the login page
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).send("Error deleting account. Please try again.");
        }
        res.status(200).json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).send("An error occurred while deleting the account.");
    }
  });
  
  // Define the deleteOldMeals function and schedule it
  const deleteOldMeals = async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString(); //(rn set to 10 mins) || 24 * 60 * 60 * 1000 <= should use this number for 1 day (testing purpose i put 1 min)
  
      const { error } = await supabase
        .from('dailymeals')
        .delete()
        .lt('created_at', oneDayAgo); // Deletes entries older than 24 hours
  
      if (error) {
        console.error("Error deleting old meals:", error);
      } else {
        console.log("Old meals deleted successfully");
      }
    } catch (error) {
      console.error("Unexpected error during meal deletion:", error);
    }
  };
  
  // Schedule the deletion to run every 24 hours
  setInterval(deleteOldMeals, 10 * 60 * 1000); //(rn set to 10 mins) || 24 * 60 * 60 * 1000 <= should use this number for 1 day (testing purpose i put 1 min)

  //--------------------------------------------------------- Admin route ---------------------------------------------------------
app.get("/admin", isAuthenticated, async (req, res) => {
  try {
    // Fetch flagged user details from the 'users' table where flag_reason is not NULL and matches specific reasons
    const { data: flaggedUsers, error: usersError } = await supabase
      .from('users')
      .select('*') // Select all user details
      .in('flag_reason', [
        'MISLEADING PICTURE',
        'HARMFUL CONTENT',
        'PORNOGRAPHIC REFERENCES',
        'HATE SPEECH AND DISCRIMINATION',
        'HARASSMENT',
        'MISINFORMATION'
      ]) // Filter by flag_reason
      .not('flag_reason', 'is', null); // Ensure flag_reason is not NULL

    // Handle any errors
    if (usersError) {
      console.error("Error fetching flagged user details:", usersError);
      res.status(500).send("An error occurred. Please try again.");
    } else {
      // Render 'admin.ejs' and pass the flagged user details
      res.render("admin.ejs", { flaggedUsers });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("An error occurred. Please try again.");
  }
});

// Admin Report Route (handling POST request for reports)
app.post('/admin', isAuthenticated, async (req, res) => {
  const { report_id, restriction_type, duration, description, username } = req.body;

  try {
    // Insert report data into the database (no image upload)
    const { error: dbError } = await supabase
      .from("flags") // The table for storing reports (ensure you have this table in your DB)
      .insert([
        {
          report_id,
          restriction_type,
          duration,
          description,
          username,
        },
      ]);

    if (dbError) {
      console.error("Error saving report to database:", dbError);
      return res.status(500).send("Error submitting the report.");
    }

    // After inserting the report, update the 'users' table to nullify the flags
      const { error: updateError } = await supabase
      .from('users')  // Users table
      .update({
        flag_reason: null,  // Set flag_reason to null
        flag_description: null,  // Set flag_description to null
        flagged_post: null,  // Set flagged_post to null
      })
      .eq('username', username);  // Match based on username

      if (updateError) {
        console.error("Error updating user flag data:", updateError);
        return res.status(500).send("Error updating user flag data.");
      }

    res.status(200).json({ message: "Report submitted successfully!" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("An error occurred. Please try again.");
  }
});

//--------------------------------------------------------- Endpoint to get notifications for the logged-in user ------------------------
app.get('/notifications', isAuthenticated, async (req, res) => {
  const userId = req.session.user_id;
  console.log(userId);
  const receiver = req.session.username;
  console.log(receiver);


  try {
      // Fetch notifications for the logged-in user, ordered by created_at in descending order
      const { data: notifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('id, sender_user_id, target_post_id, type, created_at')
          .eq('receiver_user_id', userId)
          .eq('is_read', false)
          .order('created_at', { ascending: false }); // Most recent first

      if (notificationsError) throw notificationsError;

        // // Fetch receiver username
        // const { data: receiver, error: receiverError } = await supabase
        // .from('users')
        // .select('user_id , username')
        // .eq('user_id', userId)
        // .not('user_id', 'is', null);

        // if (receiverError) throw receiverError;
        

        // Fetch only the 'restriction_type' column where 'restriction_type' is equal to 'warning'
        const { data: flags, error: flaggedPostsError } = await supabase
          .from('flags')
          .select('username, restriction_type, description')  
          .eq('restriction_type', 'Warning')  // Filter for rows where restriction_type == 'warning'
          .not('restriction_type', 'is', null);  // Ensure 'restriction_type' is not null

        if (flaggedPostsError) throw flaggedPostsError;
        console.log(flags.length);

        // Check if any flags exist and if the username matches the current user's username
        const relevantFlags = flags.filter(flag => flag.username === receiver);
        console.log(relevantFlags.length);

      // Fetch user and post information needed for each notification
      const enrichedNotifications = await Promise.all(notifications.map(async (notification) => {
          // Get the sender's username and profile picture
          const { data: sender, error: senderError } = await supabase
              .from('users')
              .select('username, profile_picture')
              .eq('user_id', notification.sender_user_id)
              .single();
          
          if (senderError) {
              console.error("Error fetching sender:", senderError);
              return null;
          }

          // Get the post title based on target_post_id
          const { data: post, error: postError } = await supabase
              .from('posts')
              .select('title')
              .eq('id', notification.target_post_id)
              .single();

          if (postError) {
              console.error("Error fetching post title:", postError);
              return null;
          }

          // Structure notification data with sender info, post title, and notification type
          return {
              id : notification.id,
              target_post_id : notification.target_post_id,
              senderUsername: sender.username,
              senderProfilePicture: sender.profile_picture,
              postTitle: post.title,
              type: notification.type,
              createdAt: notification.created_at,
          };
      }));

      // Filter out any null values in case of errors
      const validNotifications = enrichedNotifications.filter(item => item !== null);

      res.render('notifications.ejs', { flags: relevantFlags, notifications: validNotifications });
  } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).send("An error occurred while fetching notifications.");
  }
});

// Mark a specific notification as read
app.post('/notifications/read/:id', isAuthenticated, async (req, res) => {
  const notificationId = req.params.id;

  console.log("What is my notification id?", notificationId);
  try {
      const { error } = await supabase
          .from('notifications')
          .update({ is_read: true }) // Assuming you have an `is_read` column
          .eq('id', notificationId);
      
      if (error) throw error;
      console.log("it is now marked as read");
      res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Fetch latest notifications for the logged-in user
app.get('/notifications/latest', isAuthenticated, async (req, res) => {
  const userId = req.session.user_id;

  try {
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('sender_user_id, target_post_id, type, created_at')
      .eq('receiver_user_id', userId)
      .order('created_at', { ascending: false });

    if (notificationsError) throw notificationsError;

    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        try {
          // Get sender details
          const { data: sender, error: senderError } = await supabase
            .from('users')
            .select('username, profile_picture')
            .eq('user_id', notification.sender_user_id)
            .single();

          if (senderError) {
            console.error("Sender data error:", senderError);
            return null; // Skip this notification if sender data fails
          }

          // Get post title
          const { data: post, error: postError } = await supabase
            .from('posts')
            .select('title')
            .eq('id', notification.target_post_id)
            .single();

          if (postError) {
            console.error("Post data error:", postError);
            return null; // Skip this notification if post data fails
          }

          return {
            senderUsername: sender.username,
            senderProfilePicture: sender.profile_picture,
            postTitle: post.title,
            type: notification.type,
            createdAt: notification.created_at,
          };
        } catch (error) {
          console.error("Error enriching notification data:", error);
          return null;
        }
      })
    );

    const validNotifications = enrichedNotifications.filter(
      (item) => item !== null
    );
    res.json(validNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Clear all notifications for the logged-in user
app.delete('/notifications/clear', isAuthenticated, async (req, res) => {
  const userId = req.session.user_id;
  try {
      const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('receiver_user_id', userId);

      if (error) throw error;
      res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
      console.error("Error clearing notifications:", error);
      res.status(500).json({ error: "Failed to clear notifications" });
  }
});

app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
      if (err) {
          console.error("Error logging out:", err);
          return res.status(500).send("Failed to log out.");
      }
      // Redirect to login page or homepage after logging out
      res.redirect("/"); // Adjust this path to your login page
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});