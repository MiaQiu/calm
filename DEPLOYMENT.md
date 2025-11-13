# Deploying Calm to Vercel

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed globally: `npm install -g vercel`

## Step 1: Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

## Step 2: Log in to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

## Step 3: Deploy to Vercel

From your project directory (`/Users/mia/calm`), run:

```bash
vercel
```

The CLI will ask you several questions:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → calm (or your preferred name)
- **Which directory?** → ./ (current directory)
- **Override settings?** → No

Vercel will then build and deploy your app. You'll get a preview URL.

## Step 4: Set Environment Variables

After the first deployment, add your API keys to Vercel:

### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `DEEPGRAM_API_KEY` = your-deepgram-key
   - `ANTHROPIC_API_KEY` = your-anthropic-key
   - `ELEVENLABS_API_KEY` = your-elevenlabs-key
   - `ELEVENLABS_VOICE_ID` = SAz9YHcvj6GT2YYXdXww

### Option B: Via Vercel CLI
```bash
vercel env add DEEPGRAM_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add ELEVENLABS_API_KEY
vercel env add ELEVENLABS_VOICE_ID
```

## Step 5: Redeploy with Environment Variables

After adding environment variables, redeploy:

```bash
vercel --prod
```

This will deploy to production with your custom domain (e.g., `calm.vercel.app`).

## Step 6: Test Your Deployment

Visit your Vercel URL (shown after deployment completes) and test:
1. The breathing circle appears
2. Clicking the circle plays the welcome audio
3. Microphone permission is requested
4. Voice detection works
5. AI responses are generated

## Step 7: Custom Domain (Optional)

To add a custom domain:
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Audio Files Not Playing
- Ensure the `/public/audio/` folder is included in deployment
- Check browser console for 404 errors
- Verify file paths are correct in the code

### API Errors
- Check environment variables are set correctly
- View logs in Vercel Dashboard under **Deployments** → Click deployment → **Logs**

### Microphone Not Working
- HTTPS is required for microphone access (Vercel provides HTTPS automatically)
- Check browser permissions

## Important Notes

- **Audio Files**: The `i_am_here.mp3` file needs to be created and added to `/public/audio/` before deployment
- **API Limits**: Monitor your API usage for Deepgram, Claude, and ElevenLabs
- **Cold Starts**: First request after inactivity may be slower (serverless function cold start)

## Monitoring

View your app's performance:
```bash
vercel logs
```

Or check the Vercel Dashboard for detailed analytics and logs.

## Updating Your App

To deploy updates:
```bash
vercel --prod
```

Or set up automatic deployments with GitHub:
1. Push your code to GitHub
2. Import the repository in Vercel Dashboard
3. Every push to main branch will auto-deploy
