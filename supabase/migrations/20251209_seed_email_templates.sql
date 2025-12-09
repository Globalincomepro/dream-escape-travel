-- Seed Email Sequences and Templates
-- Run this after the email_campaigns migration

-- =====================================================
-- CREATE PROSPECT SEQUENCE
-- =====================================================
INSERT INTO public.email_sequences (id, name, description, sequence_type, is_active)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Prospect Nurture Sequence',
  'Automated 7-email sequence for new leads over 21 days',
  'prospect',
  true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- PROSPECT EMAIL TEMPLATES (7 Emails)
-- =====================================================

-- Email 1: Welcome (Day 0 - Immediate)
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Welcome Email',
  '🌴 Welcome {{first_name}}! Your Exclusive Travel Video Is Ready',
  0,
  1,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0077B6, #00A8E8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .cta-button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome, {{first_name}}! 🎉</h1>
  </div>
  <div class="content">
    <p>We''re so excited you''re here!</p>
    
    <p>We''re not influencers. We''re not rich. But we travel more now than we ever imagined—and we can''t wait to show you how.</p>
    
    <p style="text-align: center;">
      <a href="https://iluvmytravelclub.com" class="cta-button">🎬 Watch Your Free Video Now</a>
    </p>
    
    <p>In just a few minutes, you''ll discover the exact system that changed everything for us.</p>
    
    <p>Talk soon,<br/>
    <strong>Donna & Charles</strong></p>
  </div>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Email 2: Day 2 - Soft Reminder
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Soft Reminder',
  'Did you get a chance to watch, {{first_name}}? 👀',
  2,
  2,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .cta-button { display: inline-block; background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hey {{first_name}},</h1>
  
  <p>Life gets busy—we totally get it!</p>
  
  <p>But we didn''t want you to miss the video we sent. It''s only a few minutes, and it could change how you think about travel forever.</p>
  
  <p><strong>Here''s what people usually say after watching:</strong></p>
  <ul>
    <li>"Why didn''t I know about this sooner?!"</li>
    <li>"This is actually real?!"</li>
  </ul>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com" class="cta-button">🎬 Watch Now - It''s Free</a>
  </p>
  
  <p>Your next adventure is closer than you think.</p>
  
  <p>Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Email 3: Day 4 - Social Proof
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Social Proof',
  '{{first_name}}, here''s what Sarah from Ohio said... ✈️',
  4,
  3,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .testimonial { background: #f0f9ff; border-left: 4px solid #0077B6; padding: 20px; margin: 20px 0; font-style: italic; }
    .cta-button { display: inline-block; background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hi {{first_name}},</h1>
  
  <p>We wanted to share something that made us smile:</p>
  
  <div class="testimonial">
    "I was skeptical at first, but Donna and Charles were so genuine. We just booked a 5-star resort in Cancun for less than what we paid for a 3-star last year. My husband still can''t believe it!"
    <br/><strong>— Sarah M., Ohio</strong>
  </div>
  
  <p>Stories like Sarah''s are exactly why we do this.</p>
  
  <p><strong>We''re not promising miracles.</strong> We''re just sharing what worked for us—and thousands of others.</p>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com" class="cta-button">See How It Works →</a>
  </p>
  
  <p>Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Email 4: Day 7 - The "Why Now" Email
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Why Now',
  'Honest question, {{first_name}}...',
  7,
  4,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .cta-button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hey {{first_name}},</h1>
  
  <p>Can we be real with you for a second?</p>
  
  <p>We get a lot of people who sign up, mean to watch the video, and then... life happens. Weeks go by. Then months.</p>
  
  <p>And that dream vacation? Still just a dream.</p>
  
  <p><strong>We don''t want that for you.</strong></p>
  
  <p>If travel is something you actually want more of in your life, take 5 minutes today. Just 5 minutes.</p>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com" class="cta-button">🎬 Watch the Video</a>
  </p>
  
  <p>The worst that happens? You learn something new. The best? Your whole travel life changes.</p>
  
  <p>Rooting for you,<br/>
  Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Email 5: Day 10 - Income Angle
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Income Opportunity',
  'What if travel could PAY you, {{first_name}}? 💰',
  10,
  5,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .highlight { background: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hi {{first_name}},</h1>
  
  <p>We haven''t mentioned this yet, but there''s another side to what we do.</p>
  
  <p>Not only do we travel for a fraction of the cost... <strong>we actually earn income while doing it.</strong></p>
  
  <p>No, seriously.</p>
  
  <div class="highlight">
    <p>Some people just use the membership to save money. Others (like us) share it with friends and family—and get paid for it.</p>
    <p><strong>It''s completely optional</strong>, but we wanted you to know the full picture.</p>
  </div>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com" class="cta-button">Learn About the Opportunity →</a>
  </p>
  
  <p>Either way, we''re happy you''re here.</p>
  
  <p>Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Email 6: Day 14 - Scarcity
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Urgency',
  '{{first_name}}, we''re closing spots soon 🚨',
  14,
  6,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fff0f0; border: 1px solid #ff6b6b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hey {{first_name}},</h1>
  
  <p>Quick heads up—</p>
  
  <div class="alert">
    <p>We only work with a limited number of new travelers each month. It helps us give everyone the personal attention they deserve.</p>
    <p><strong>We''re getting close to our cap for this month.</strong></p>
  </div>
  
  <p>If you''ve been on the fence, now''s the time to watch the video and see if this is right for you.</p>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com" class="cta-button">🎬 Watch Before Spots Fill Up</a>
  </p>
  
  <p>No pressure—but we''d hate for you to miss out.</p>
  
  <p>Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Email 7: Day 21 - Final Goodbye
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Final Email',
  'Is this goodbye, {{first_name}}? 🥺',
  21,
  7,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .cta-button { display: inline-block; background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hi {{first_name}},</h1>
  
  <p>We''ve sent a few emails now, and we totally understand if this isn''t the right time for you.</p>
  
  <p><strong>No hard feelings at all.</strong></p>
  
  <p>But before we stop reaching out, we wanted to give you one last chance to see what we''ve been talking about.</p>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com" class="cta-button">🎬 One Last Look →</a>
  </p>
  
  <p>If you ever want to chat about travel, we''re always here. Just reply to this email.</p>
  
  <p>Wishing you amazing adventures—however you take them.</p>
  
  <p>With love,<br/>
  Donna & Charles</p>
  
  <p style="font-size: 12px; color: #888;">
    P.S. — If you''d rather not hear from us, just click unsubscribe below. No worries! 💙
  </p>
</body>
</html>'
) ON CONFLICT DO NOTHING;


-- =====================================================
-- CREATE AMBASSADOR SEQUENCE
-- =====================================================
INSERT INTO public.email_sequences (id, name, description, sequence_type, is_active)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Ambassador Onboarding',
  'Automated 7-email sequence for new ambassadors over 14 days',
  'ambassador',
  true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- AMBASSADOR EMAIL TEMPLATES (7 Emails)
-- =====================================================

-- Ambassador Email 1: Welcome (Day 0)
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Welcome to Team',
  '🎉 Welcome to the Team, {{first_name}}! Here''s Your First Step',
  0,
  1,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .cta-button { display: inline-block; background: #9333ea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
    .step { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #9333ea; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Congratulations, {{first_name}}!</h1>
    <p>Welcome to the MWR Travel Family!</p>
  </div>
  <div class="content">
    <p>You just made an incredible decision. We''re so excited to have you on the team!</p>
    
    <p><strong>Here''s what happens next:</strong></p>
    
    <div class="step">1️⃣ Your personal funnel page is now LIVE</div>
    <div class="step">2️⃣ Log in to your Ambassador Dashboard</div>
    <div class="step">3️⃣ Customize your page and start sharing!</div>
    
    <p style="text-align: center;">
      <a href="https://iluvmytravelclub.com/ambassador/dashboard" class="cta-button">🚀 Access Your Dashboard Now</a>
    </p>
    
    <p>We''re here to support you every step of the way.</p>
    
    <p>Let''s do this together,<br/>
    <strong>Donna & Charles</strong></p>
  </div>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Ambassador Email 2: Day 1 - Set Up Funnel
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Customize Funnel',
  '{{first_name}}, let''s make your funnel page shine ✨',
  1,
  2,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .cta-button { display: inline-block; background: #9333ea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hey {{first_name}}!</h1>
  
  <p>Quick question: Have you customized your funnel page yet?</p>
  
  <p>Your funnel is how people learn about this opportunity from YOU. A personalized touch makes all the difference!</p>
  
  <p><strong>In your dashboard, you can:</strong></p>
  <ul>
    <li>Upload your own travel photos</li>
    <li>Add your personal story</li>
    <li>Customize your funnel URL</li>
  </ul>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com/ambassador/settings" class="cta-button">⚙️ Customize Your Funnel</a>
  </p>
  
  <p>Takes about 5 minutes and makes a huge impact.</p>
  
  <p>You''ve got this!<br/>
  Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Ambassador Email 3: Day 3 - Your Link
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Your Unique Link',
  'Your golden ticket 🎟️ (save this link!)',
  3,
  3,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .link-box { background: #f0f9ff; border: 2px dashed #0077B6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hi {{first_name}},</h1>
  
  <p>Here''s the most important thing you own now:</p>
  
  <div class="link-box">
    <p style="font-weight: bold;">Your Personal Funnel Link</p>
    <p style="color: #0077B6;">Find it in your Ambassador Dashboard</p>
  </div>
  
  <p>This is YOUR link. When anyone signs up through it, you get credit!</p>
  
  <p><strong>Easy ways to share:</strong></p>
  <ul>
    <li>📱 Add it to your Instagram/Facebook bio</li>
    <li>💬 Send it to friends who love travel</li>
    <li>📧 Include it in your email signature</li>
  </ul>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com/ambassador/dashboard" class="cta-button">📋 Copy Your Link from Dashboard</a>
  </p>
  
  <p>Start sharing today!<br/>
  Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Ambassador Email 4: Day 5 - Content Library
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Content Library Tips',
  'Free content to share (we made it easy!) 📸',
  5,
  4,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .feature { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .cta-button { display: inline-block; background: #9333ea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hey {{first_name}}!</h1>
  
  <p>Don''t know what to post? We''ve got you covered!</p>
  
  <p>Inside your dashboard, there''s a <strong>Content Library</strong> packed with:</p>
  
  <div class="feature">🖼️ Beautiful travel images</div>
  <div class="feature">📝 Ready-to-use captions</div>
  <div class="feature">#️⃣ Hashtag suggestions</div>
  
  <p><strong>Just copy, paste, and share.</strong> It''s that simple!</p>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com/ambassador/content" class="cta-button">📚 Browse Content Library</a>
  </p>
  
  <p>You don''t have to create content from scratch. We''ve done the hard work for you.</p>
  
  <p>Happy sharing!<br/>
  Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Ambassador Email 5: Day 7 - First Lead Tips
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Get First Lead',
  'How to get your first lead this week 🎯',
  7,
  5,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .tip { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; }
    .cta-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hi {{first_name}},</h1>
  
  <p>Ready to get your first lead? Here are 3 simple strategies that work:</p>
  
  <div class="tip">
    <strong>1. The Personal Story</strong><br/>
    Share your "why" on social media. Why did you join? What excited you about travel?
  </div>
  
  <div class="tip">
    <strong>2. The Curiosity Post</strong><br/>
    "Just discovered how we can travel to 5-star resorts for way less... DM me if you want to know more 👀"
  </div>
  
  <div class="tip">
    <strong>3. The Direct Message</strong><br/>
    Think of 5 people you know who love travel. Send them your link personally!
  </div>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com/my-leads" class="cta-button">📊 Check Your Lead Dashboard</a>
  </p>
  
  <p>Your first lead could come today. Keep going!</p>
  
  <p>Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Ambassador Email 6: Day 10 - Earnings
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Understanding Earnings',
  'Let''s talk about 💰 (the fun part!)',
  10,
  6,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .earnings { background: #fef9c3; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #eab308; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hey {{first_name}},</h1>
  
  <p>Let''s talk about everyone''s favorite topic: <strong>getting paid!</strong></p>
  
  <div class="earnings">
    <p><strong>Here''s how it works:</strong></p>
    <p>📌 When someone signs up through your link → You earn commission</p>
    <p>📌 When they travel → You can earn bonuses</p>
    <p>📌 When they become ambassadors → Residual income!</p>
  </div>
  
  <p><strong>Check your earnings anytime in your dashboard.</strong></p>
  
  <p>The more you share, the more you earn. Simple as that!</p>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com/ambassador/dashboard" class="cta-button">💰 View Your Dashboard</a>
  </p>
  
  <p>Questions? Just reply to this email.</p>
  
  <p>Donna & Charles</p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

-- Ambassador Email 7: Day 14 - Motivation
INSERT INTO public.email_templates (sequence_id, name, subject, delay_days, step_order, is_active, html_content)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'You''re Not Alone',
  'We''re in this together, {{first_name}} 💙',
  14,
  7,
  true,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .message { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hi {{first_name}},</h1>
  
  <p>Two weeks in! How are you feeling?</p>
  
  <p>We remember exactly how it felt when we started. Excited, maybe a little uncertain, wondering if we could really do this.</p>
  
  <p><strong>Spoiler: You absolutely can.</strong></p>
  
  <div class="message">
    <p>✅ It''s okay if you haven''t gotten leads yet—keep sharing</p>
    <p>✅ Consistency beats perfection every time</p>
    <p>✅ We''re here if you need help—just reply!</p>
  </div>
  
  <p><strong>You joined for a reason.</strong> Don''t give up on that dream.</p>
  
  <p style="text-align: center;">
    <a href="https://iluvmytravelclub.com/ambassador/dashboard" class="cta-button">🏠 Back to Dashboard</a>
  </p>
  
  <p>We believe in you,<br/>
  <strong>Donna & Charles</strong></p>
  
  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    P.S. — The ambassadors who succeed are the ones who keep showing up. You''ve got this! 💪
  </p>
</body>
</html>'
) ON CONFLICT DO NOTHING;

