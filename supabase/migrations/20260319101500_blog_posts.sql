create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  category text default 'general',
  author_id uuid references public.employees(id) on delete set null,
  is_published boolean default false,
  published_at timestamptz,
  read_time_minutes int default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_published_idx on public.blog_posts(is_published, published_at desc);

alter table public.blog_posts enable row level security;

create policy "Public can read published posts"
  on public.blog_posts
  for select
  using (is_published = true);

create policy "Service role manages posts"
  on public.blog_posts
  for all
  using (auth.role() = 'service_role');

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  cover_image,
  category,
  author_id,
  is_published,
  published_at,
  read_time_minutes
)
values
  (
    '5 exercises to relieve lower back pain at home',
    '5-exercises-to-relieve-lower-back-pain-at-home',
    'Lower back discomfort is one of the most common reasons people pause exercise. A short routine done consistently can improve mobility and reduce daily pain flare-ups.',
    'Start with gentle movement, not intensity. Controlled pelvic tilts, cat-cow motion, and supported child''s pose help your spine move through safe ranges and reduce stiffness from prolonged sitting.' || E'\n\n' ||
    'Once pain settles, add stability drills like dead bugs and glute bridges. These movements train your core and hips to share load better, so your lower back does not compensate during everyday tasks.' || E'\n\n' ||
    'Finish with consistency over perfection. Ten to fifteen minutes, four to five days per week, is often more effective than one long session. If pain radiates to the leg or worsens, get an in-person assessment.',
    '/media/blog/klinichka-masaza-i-rehabilitacija.svg',
    'exercises',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    true,
    now() - interval '8 days',
    6
  ),
  (
    'What to expect at your first chiropractic adjustment',
    'what-to-expect-at-your-first-chiropractic-adjustment',
    'A first chiropractic visit is focused on understanding your symptoms and movement patterns. Most sessions include clear explanations before any manual treatment begins.',
    'Your first appointment starts with history and posture review. Your therapist will ask about pain triggers, previous injuries, work routine, and activity level to understand where your symptoms come from.' || E'\n\n' ||
    'Next comes movement testing and joint assessment. You may hear a small click during adjustment, but the goal is improved joint mechanics, not force. Techniques are selected based on your comfort and findings.' || E'\n\n' ||
    'After treatment, you usually receive simple home advice for the next 24 to 48 hours. Mild soreness can happen, similar to post-workout discomfort. Follow-up care is planned according to your response and goals.',
    '/media/blog/kiropraktichki-tehniki.svg',
    'chiropractic',
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    true,
    now() - interval '18 days',
    5
  ),
  (
    'How dry needling works and who it helps',
    'how-dry-needling-works-and-who-it-helps',
    'Dry needling targets tight, overactive muscle trigger points that contribute to pain and reduced motion. It is often combined with exercise for better long-term results.',
    'Dry needling uses a fine filament needle to stimulate trigger points in affected muscles. The goal is to reduce local tension, improve blood flow, and normalize how that muscle activates during movement.' || E'\n\n' ||
    'It can be useful for persistent neck pain, shoulder irritation, calf tightness, and some headache patterns. The right candidate is determined after assessment, not by symptoms alone.' || E'\n\n' ||
    'Results are strongest when paired with corrective exercise and load management. Needling can reduce short-term pain, while movement retraining addresses the root mechanical factors behind recurrence.',
    '/media/blog/dry-needling.svg',
    'injury-rehab',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    true,
    now() - interval '34 days',
    4
  ),
  (
    'The role of nutrition in muscle recovery',
    'the-role-of-nutrition-in-muscle-recovery',
    'Recovery is shaped by more than training quality alone. Protein timing, hydration, and daily energy intake all influence tissue repair and performance.',
    'After demanding sessions, muscle tissue needs amino acids to rebuild. Aim for a protein source in the first few hours after activity and distribute intake across the day for better synthesis.' || E'\n\n' ||
    'Carbohydrates are equally important when training frequency is high. They replenish glycogen and support consistent output. Poor fueling can increase fatigue and delay rehabilitation progress.' || E'\n\n' ||
    'Hydration and micronutrients complete the picture. Electrolytes, iron status, and vitamin D can influence recovery quality, especially in active adults. Nutrition should match your training load and clinical goals.',
    '/media/blog/manuelna-limfna-drenaza.svg',
    'nutrition',
    'f742eb1e-72ae-4bbd-9554-8df3f96e8c33',
    true,
    now() - interval '49 days',
    7
  ),
  (
    'Managing sports injuries: when to rest, when to push',
    'managing-sports-injuries-when-to-rest-when-to-push',
    'Complete rest is not always the fastest path back to sport. Smart loading helps tissues heal while preserving strength and confidence.',
    'The first decision after injury is to calm symptoms without shutting movement down entirely. Relative rest means reducing painful activities while keeping safe, pain-limited motion in place.' || E'\n\n' ||
    'As pain and swelling improve, graded loading begins. Exercises should challenge the injured area progressively with clear criteria for volume and intensity. This lowers re-injury risk when returning to sport.' || E'\n\n' ||
    'Use objective markers to guide progression: pain response, next-day stiffness, and movement quality. If these markers trend positively, you can push. If they worsen, adjust load and reassess technique.',
    '/media/blog/kineziterapija.svg',
    'injury-rehab',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    true,
    now() - interval '66 days',
    8
  ),
  (
    'Posture correction in the age of remote work',
    'posture-correction-in-the-age-of-remote-work',
    'Remote work has increased neck and upper-back complaints across all age groups. Better workstation setup and frequent movement breaks can reduce daily strain.',
    'There is no single perfect posture to hold all day. The real goal is posture variability: changing positions often and avoiding prolonged static loading of the same joints and muscles.' || E'\n\n' ||
    'Start with practical desk changes. Keep your screen at eye level, feet supported, and keyboard close enough to avoid shoulder elevation. Small adjustments can reduce cumulative strain over long workdays.' || E'\n\n' ||
    'Add movement snacks every 30 to 45 minutes. Short mobility drills for thoracic extension, neck rotation, and hip opening can reset tension and maintain focus without interrupting productivity.',
    '/media/blog/hidzama-terapija.svg',
    'exercises',
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    true,
    now() - interval '82 days',
    5
  );
