truncate table
  public.appointments,
  public.appointment_slots,
  public.employee_certificates,
  public.reviews,
  public.documents,
  public.treatments,
  public.blog_posts,
  public.employees,
  public.site_metrics
restart identity cascade;

insert into public.employees (
  id,
  name,
  description,
  image_path,
  specialization,
  phone_primary,
  phone_secondary,
  is_active
)
values
  (
    '0f2a54b6-1f1d-4f54-8a51-13c3765a1011',
    'Антонио Ѓурчиноски',
    $$Дипломиран и лиценциран физиотерапевт посветен на врвна грижа и резултати. Долгогодишно искууство во тремани на мускулно-скелетни проблеми. Со континуирани едукации и практично искуство во професионална киропрактика, клинички масажи, хиџама терапија (вендузи) и dry needling, пристапувам индивидуално кон секој клиент. Мојата цел е прецизна дијагностика, ефективен третман и долгорочно решение, со максимален професионализам и внимание кон секој детал. Постојано се надградувам за да понудам современи и докажани методи за брзо закрепнување и подобар квалитет на живот.$$,
    '/media/employees/antonio-gjurcinoski.svg',
    'Специјализиран / Сертифициран со напредни едукации во Клинички Масажи и рехабилитација, Терапија Хиџама (Вендузи терпија) на локомотоен апарат, Dry Needling терапија, Кинезитерпија, Мануелна лимфна дренажа, Сертифицирани и напредни Киропрактички техники, Прецизна мануелна мобилизација на зглобови.',
    '078 - 831 - 711',
    '078 - 983 - 088',
    true
  ),
  (
    '2a8a5e95-0398-43c7-9f35-6720173fbe22',
    'Јованка Ѓурчиноска',
    $$Сертифицирана и верифицирана масер за: Реклас масажа, Медицинска масажа, Спортска масажа, Мадеро терпија, Вакум терпија (Вендузи), Антистрес масажа, Антицелулитна терапија како и спортска масажа, за регенерација на мискулите. Професионално посветена и на Мадеро терпија и антицелулитните третмани за подобрување на циркулацијата, намалување на масните наслаги, и обликување на телото. Професионална Лимфна дренажа на цело тело. Нејзината цел е на клиентите да се чуствуваат опуштено, здраво, витално и енергично по секој третман.$$,
    '/media/employees/jovanka-gjurcinoska.svg',
    'Сертифицирана масерка за медицински, спортски, антистрес и антицелулитни третмани со лимфна дренажа.',
    null,
    null,
    true
  );

insert into public.employee_certificates (employee_id, title, issuer, issued_on, file_path, sort_order)
values
  ('0f2a54b6-1f1d-4f54-8a51-13c3765a1011', 'Dry Needling терапија', 'International Dry Needling Academy', date '2024-05-10', '/documents/certificate-dry-needling.svg', 1),
  ('0f2a54b6-1f1d-4f54-8a51-13c3765a1011', 'Киропрактички напредни техники', 'Manual Therapy Institute', date '2023-11-22', '/documents/certificate-chiro-advanced.svg', 2),
  ('0f2a54b6-1f1d-4f54-8a51-13c3765a1011', 'Клинички масажи и рехабилитација', 'Clinical Rehab Center', date '2022-09-15', '/documents/certificate-clinical-massage.svg', 3),
  ('2a8a5e95-0398-43c7-9f35-6720173fbe22', 'Медицинска и спортска масажа', 'Bodywork Academy', date '2023-03-20', '/documents/certificate-medical-sport-massage.svg', 1),
  ('2a8a5e95-0398-43c7-9f35-6720173fbe22', 'Мадеро и антицелулитна терапија', 'Aesthetic Therapy School', date '2024-01-18', '/documents/certificate-madero.svg', 2),
  ('2a8a5e95-0398-43c7-9f35-6720173fbe22', 'Професионална лимфна дренажа', 'Lymphatic Care Institute', date '2024-06-11', '/documents/certificate-lymphatic.svg', 3);

insert into public.blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  cover_image,
  category,
  author_id,
  is_published,
  published_at,
  read_time_minutes,
  updated_at
)
values
  (
    '35b30760-ae8a-4a71-9a8f-228dd38ed001',
    'Клиничка масажа и рехабилитација: кога е најдобар избор',
    'klinichka-masaza-i-rehabilitacija',
    'Комбинираме клиничка масажа со рехабилитациски план за побрзо намалување на болка и враќање на функцијата.',
    $$Клиничката масажа и рехабилитацијата се најдобри кога се работи за хронична напнатост, ограничена подвижност и опоравување по повреда.

Третманот вклучува прецизна мануелна работа на проблематичните структури, а потоа и вежби за стабилност и контрола на движење.

Целта е да не се добие само моментално олеснување, туку и долгорочна функционалност со јасен план за домашна грижа.$$,
    '/media/blog/klinichka-masaza-i-rehabilitacija.svg',
    'injury-rehab',
    '0f2a54b6-1f1d-4f54-8a51-13c3765a1011',
    true,
    now() - interval '8 days',
    5,
    now()
  ),
  (
    '35b30760-ae8a-4a71-9a8f-228dd38ed002',
    'Хиџама терапија (вендузи) на локомоторен апарат',
    'hidzama-terapija-venduzi-lokomotoren-aparat',
    'Хиџама третманите се користат за подобра циркулација, намалување на мускулна напнатост и побрзо закрепнување.',
    $$Хиџама терапијата (вендузи) е корисна кај мускулни затегнатости, локален замор и ограничена подвижност по напор.

Со контролирана апликација на вендузи се поттикнува микроциркулација и локална декомпресија на ткивото.

Во Physio Patella, хиџамата ја комбинираме со мануелна терапија и кинезитерапија за поодржлив резултат.$$,
    '/media/blog/hidzama-terapija.svg',
    'injury-rehab',
    '0f2a54b6-1f1d-4f54-8a51-13c3765a1011',
    true,
    now() - interval '14 days',
    4,
    now()
  ),
  (
    '35b30760-ae8a-4a71-9a8f-228dd38ed003',
    'Dry Needling терапија: прецизно ослободување на тригер точки',
    'dry-needling-terapija-trigger-tochki',
    'Dry needling третман за намалување на болка, подобра мускулна активација и побрз опоравок.',
    $$Dry needling е насочен третман за мускули со активни тригер точки што создаваат локална и пренесена болка.

Со тенка игла се стимулира променетото ткиво, со цел намалување на спазам и подобрување на подвижност.

Терапијата секогаш се комбинира со индивидуален план за движење за долгорочна стабилност.$$,
    '/media/blog/dry-needling.svg',
    'injury-rehab',
    '0f2a54b6-1f1d-4f54-8a51-13c3765a1011',
    true,
    now() - interval '20 days',
    4,
    now()
  ),
  (
    '35b30760-ae8a-4a71-9a8f-228dd38ed004',
    'Кинезитерапија за стабилност и враќање на движење',
    'kineziterapija-za-stabilnost',
    'Персонализирани кинезитерапевтски програми за зголемување на сила, контрола и функционалност.',
    $$Кинезитерапијата е клучен дел од секој процес на опоравување.

Преку внимателно избрани вежби се подобрува мобилноста, силата и моторната контрола без непотребен стрес.

Програмата се приспособува на тековната состојба и целта на клиентот, со јасни фази на прогресија.$$,
    '/media/blog/kineziterapija.svg',
    'exercises',
    '0f2a54b6-1f1d-4f54-8a51-13c3765a1011',
    true,
    now() - interval '24 days',
    5,
    now()
  ),
  (
    '35b30760-ae8a-4a71-9a8f-228dd38ed005',
    'Мануелна лимфна дренажа: леснотија и регенерација',
    'manuelna-limfna-drenaza',
    'Нежна терапевтска техника за намалување на задржување течности и подобрување на циркулацијата.',
    $$Мануелната лимфна дренажа се користи кај оток, чувство на тежина и забавена локална циркулација.

Техниката е ритмична и нежна, но ефективна за подобрување на лимфниот проток.

Често се комбинира со антицелулитни и пост-рехабилитациски протоколи според потребата на клиентот.$$,
    '/media/blog/manuelna-limfna-drenaza.svg',
    'general',
    '2a8a5e95-0398-43c7-9f35-6720173fbe22',
    true,
    now() - interval '28 days',
    4,
    now()
  ),
  (
    '35b30760-ae8a-4a71-9a8f-228dd38ed006',
    'Киропрактички техники и мобилизација на зглобови',
    'kiropraktichki-tehniki-i-mobilizacija',
    'Прецизни киропрактички пристапи за подобра механика на зглобови и намалување на болка.',
    $$Киропрактичките техники во Physio Patella се применуваат по детална проценка и според јасни индикации.

Фокусот е на прецизна мануелна мобилизација на зглобови, подобрување на обем на движење и функционален баланс.

Со комбиниран пристап (мобилизација + вежби + едукација), резултатите се постабилни и подолготрајни.$$,
    '/media/blog/kiropraktichki-tehniki.svg',
    'chiropractic',
    '0f2a54b6-1f1d-4f54-8a51-13c3765a1011',
    true,
    now() - interval '32 days',
    5,
    now()
  );

insert into public.treatments (
  title,
  slug,
  description,
  icon_path,
  image_path,
  blog_post_slug,
  sort_order,
  is_published
)
values
  ('Клиничка масажа', 'klinichka-masaza', 'Клинички масажи и рехабилитација за мускулно-скелетни проблеми.', 'https://img.icons8.com/?size=100&id=1804&format=png&color=FFFFFF', 'https://img.icons8.com/?size=100&id=1804&format=png&color=FFFFFF', 'klinichka-masaza-i-rehabilitacija', 1, true),
  ('Хиџама терапија', 'hidzama-terapija', 'Терапија со вендузи на локомоторен апарат за подобра циркулација.', 'https://img.icons8.com/?size=100&id=qwEAb2Lxoaqg&format=png', 'https://img.icons8.com/?size=100&id=qwEAb2Lxoaqg&format=png', 'hidzama-terapija-venduzi-lokomotoren-aparat', 2, true),
  ('Dry Needling', 'dry-needling', 'Терапија за активни тригер точки и локална мускулна болка.', 'https://img.icons8.com/?size=100&id=NUqaAADfLgWX&format=png&color=FFFFFF', 'https://img.icons8.com/?size=100&id=NUqaAADfLgWX&format=png&color=FFFFFF', 'dry-needling-terapija-trigger-tochki', 3, true),
  ('Кинезитерапија', 'kineziterapija', 'Индивидуален план на движење за стабилност и опоравување.', 'https://img.icons8.com/?size=100&id=tBwVH3f61ZWb&format=png', 'https://img.icons8.com/?size=100&id=tBwVH3f61ZWb&format=png', 'kineziterapija-za-stabilnost', 4, true),
  ('Лимфна дренажа', 'limfna-drenaza', 'Професионална мануелна лимфна дренажа на цело тело.', 'https://img.icons8.com/?size=100&id=R5WIkTqrpDMd&format=png', 'https://img.icons8.com/?size=100&id=R5WIkTqrpDMd&format=png', 'manuelna-limfna-drenaza', 5, true),
  ('Киропрактика', 'kiropraktika', 'Сертифицирани киропрактички техники и мобилизација на зглобови.', 'https://img.icons8.com/?size=100&id=6noy0BT6FFQ0&format=png', 'https://img.icons8.com/?size=100&id=6noy0BT6FFQ0&format=png', 'kiropraktichki-tehniki-i-mobilizacija', 6, true);

insert into public.reviews (client_name, rating, quote, is_published)
values
  ('Марина Т.', 5, 'Професионален пристап, јасен план и одлична комуникација. Болката во вратот ми се намали уште по првите сесии.', true),
  ('Илија П.', 5, 'Многу сум задоволен од третманите и од вниманието кон деталите. Топла препорака.', true),
  ('Елена Р.', 5, 'Студиото е уредно, третманите се современи и резултатите се видливи.', true);

insert into public.documents (title, description, doc_type, file_path, sort_order, is_published)
values
  ('Лиценца за работа', 'Официјална лиценца за вршење физиотерапевтска дејност.', 'license', '/documents/license.svg', 1, true),
  ('Полиса за професионално осигурување', 'Валидна полиса за професионална одговорност.', 'insurance', '/documents/insurance.svg', 2, true),
  ('Политика за приватност', 'Начин на обработка и заштита на лични податоци.', 'policy', '/documents/privacy-policy.svg', 3, true);

insert into public.appointment_slots (employee_id, starts_at, ends_at, is_available)
values
  ('0f2a54b6-1f1d-4f54-8a51-13c3765a1011', date_trunc('day', now()) + interval '1 day 09:00', date_trunc('day', now()) + interval '1 day 10:30', true),
  ('0f2a54b6-1f1d-4f54-8a51-13c3765a1011', date_trunc('day', now()) + interval '1 day 11:00', date_trunc('day', now()) + interval '1 day 12:30', true),
  ('0f2a54b6-1f1d-4f54-8a51-13c3765a1011', date_trunc('day', now()) + interval '2 days 16:00', date_trunc('day', now()) + interval '2 days 17:30', true),
  ('2a8a5e95-0398-43c7-9f35-6720173fbe22', date_trunc('day', now()) + interval '1 day 13:00', date_trunc('day', now()) + interval '1 day 14:30', true),
  ('2a8a5e95-0398-43c7-9f35-6720173fbe22', date_trunc('day', now()) + interval '2 days 10:00', date_trunc('day', now()) + interval '2 days 11:30', true),
  ('2a8a5e95-0398-43c7-9f35-6720173fbe22', date_trunc('day', now()) + interval '3 days 12:00', date_trunc('day', now()) + interval '3 days 13:30', true);

insert into public.site_metrics (key, value)
values ('patients_total', 1200)
on conflict (key) do update
set value = excluded.value;
