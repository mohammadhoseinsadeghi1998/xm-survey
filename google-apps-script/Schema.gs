// GENERATED from data.js. Run: node tools/build-schema.mjs
const SCHEMA = {
  "version": "xm-iran-1",
  "competencies": [
    [
      "customer_centric",
      "توسعه سازمان مشتری‌محور (Customer-Centric Organization Development)"
    ],
    [
      "change",
      "طراحی سازمان و مدیریت تغییر (Organizational Design and Change Management)"
    ],
    [
      "strategy",
      "راهبرد تجربه (Experience Strategy)"
    ],
    [
      "behavior",
      "رفتار و تصمیم‌گیری مصرف‌کننده (Consumer Behavior and Decision-Making)"
    ],
    [
      "qualitative",
      "تحقیق و تحلیل کیفی (Qualitative Research and Analysis)"
    ],
    [
      "analytics",
      "تحلیل تجربه (Experience Analytics)"
    ],
    [
      "human_design",
      "طراحی انسان‌محور و نوآوری (Human-Centered Design and Innovation)"
    ],
    [
      "design",
      "طراحی تجربه (Experience Design)"
    ],
    [
      "digital",
      "مدیریت تجربه‌ی دیجیتال مشتری (Digital Customer Experience Management)"
    ],
    [
      "employee_experience",
      "مدیریت تجربه‌ی کارکنان (Employee Experience Management)"
    ],
    [
      "engagement",
      "مشارکت کارکنان (Employee Engagement)"
    ],
    [
      "crm",
      "مدیریت ارتباط با مشتری (Customer Relationship Management – CRM)"
    ],
    [
      "measurement",
      "سنجش تجربه و عملکرد (Measuring Experience and Performance)"
    ],
    [
      "quantitative",
      "تحلیل و مصورسازی داده‌های کمّی (Quantitative Data Analysis and Visualization)"
    ],
    [
      "integration",
      "یکپارچه‌سازی راهبردی داده‌ها و بینش‌ها (Strategic Data Integration and Insights)"
    ]
  ],
  "challengeLabels": [
    "توسعه سازمان مشتری‌محور",
    "طراحی سازمان و مدیریت تغییر",
    "راهبرد تجربه",
    "رفتار و تصمیم‌گیری مصرف‌کننده",
    "تحقیق و تحلیل کیفی",
    "تحلیل تجربه",
    "طراحی انسان‌محور و نوآوری",
    "طراحی تجربه",
    "مدیریت تجربه‌ی دیجیتال مشتری",
    "مدیریت تجربه‌ی کارکنان",
    "مشارکت کارکنان",
    "مدیریت ارتباط با مشتری",
    "سنجش تجربه و عملکرد",
    "تحلیل و مصورسازی داده‌های کمی",
    "یکپارچه‌سازی راهبردی داده‌ها و بینش‌ها"
  ],
  "questions": [
    {
      "id": "name",
      "type": "text",
      "text": "لطفاً نام و نام خانوادگی خود را وارد کنید.",
      "number": 1
    },
    {
      "id": "organization",
      "type": "text",
      "text": "لطفاً نام سازمان یا مجموعه‌ای را که در حال حاضر در آن فعالیت می‌کنید، وارد کنید.",
      "number": 2
    },
    {
      "id": "industry",
      "type": "industry",
      "text": "صنعتی را که سازمان شما در آن فعالیت می‌کند انتخاب کنید؛ در صورت انتخاب «سایر صنایع»، نام صنعت را بنویسید.",
      "options": [
        "بازار سرمایه، بورس و کارگزاری",
        "بانکداری و خدمات مالی",
        "فناوری اطلاعات، نرم‌افزار و تلکام",
        "تجارت الکترونیک و خرده‌فروشی",
        "کالاهای تندمصرف - اف‌ام‌سی‌جی",
        "بهداشت، درمان و داروسازی",
        "نفت، گاز، پتروشیمی و انرژی",
        "بیمه",
        "آموزش و پژوهش",
        "حمل‌ونقل، لجستیک و گردشگری",
        "تولیدی و صنعتی",
        "سایر صنایع (لطفاً ذکر کنید)"
      ],
      "number": 3
    },
    {
      "id": "job",
      "type": "text",
      "text": "عنوان دقیق شغل یا جایگاه فعلی خود در سازمان را وارد کنید.",
      "number": 4
    },
    {
      "id": "owner",
      "type": "radio",
      "text": "آیا در سازمان شما واحد یا جایگاه مشخصی متولی مدیریت تجربه (CX/XM) وجود دارد؟",
      "options": [
        "بله، واحد و سمت مشخص و مستقل وجود دارد.",
        "بله، اما این مسئولیت ذیل واحدهای دیگر (مثل بازاریابی، امور مشتریان یا فروش) ادغام شده است.",
        "خیر، هیچ پوزیشن یا متولی مشخصی برای تجربه وجود ندارد."
      ],
      "number": 5
    },
    {
      "id": "owner_titles",
      "type": "text",
      "conditional": true,
      "text": "عنوان یا عناوین شغلی متولیان یا تیم مدیریت تجربه در سازمان را بنویسید.",
      "hint": "مثلاً مدیر تجربه مشتری، کارشناس CX یا مدیر ارتباط با مشتریان؛ پاسخ فقط در صورت وجود متولی الزامی است.",
      "number": 6
    },
    {
      "id": "decision_maker",
      "type": "text",
      "text": "کدام عنوان شغلی یا جایگاه سازمانی، تصمیم‌گیرنده و تصویب‌کنندهٔ نهایی بودجه، راهبردها و برنامه‌های حوزهٔ تجربه است؟",
      "hint": "مثلاً مدیرعامل (CEO)، هیئت‌مدیره، معاونت ارشد بازاریابی (CMO)، مدیر عملیات (COO) یا مدیر تجربه مشتری (CXO).",
      "number": 7
    },
    {
      "id": "overall",
      "type": "radio",
      "guide": true,
      "text": "وضعیت کلی فعلی سازمان شما در زمینه‌ی XM را چگونه توصیف می‌کنید؟",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "مقطعی/واکنشی (Ad hoc/Reactive)",
        "تعریف‌شده/ساختارمند (Defined/Structured)",
        "یکپارچه/مدیریت‌شده (Integrated/Managed)",
        "بهینه/تحول‌آفرین (Optimized/Transformational)"
      ],
      "number": 1
    },
    {
      "id": "confidence",
      "type": "radio",
      "text": "میزان موافقت شما با عبارت زیر چقدر است؟\n«در مجموع، اطمینان دارم که سازمان من فرایندهای XM خود را به‌طور اثربخش مدیریت می‌کند.»",
      "options": [
        "کاملاً مخالفم (Strongly Disagree)",
        "مخالفم (Disagree)",
        "نه موافقم نه مخالف (Neither Agree Nor Disagree)",
        "موافقم (Agree)",
        "کاملاً موافقم (Strongly Agree)"
      ],
      "number": 2
    },
    {
      "id": "customer_centric",
      "type": "radio",
      "guide": true,
      "text": "توسعه سازمان مشتری‌محور (Customer-Centric Organization Development): استقرار، پایدارسازی و اولویت‌دهی به نیازها، اهداف و پیامدهای همه‌ی ذی‌نفعان از طریق همسویی راهبردی، تحول فرهنگی و رویه‌های عملیاتی.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 3
    },
    {
      "id": "change",
      "type": "radio",
      "guide": true,
      "text": "طراحی سازمان و مدیریت تغییر (Organizational Design and Change Management): طراحی کمیته‌های چابک و ذی‌نفع‌محور و اجرای راهبردهای اثربخش مدیریت تغییر، به‌گونه‌ای که سازگاری روان سازمان ما با نیازها و محیط‌های در حال تحول را ممکن سازد.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 4
    },
    {
      "id": "strategy",
      "type": "radio",
      "guide": true,
      "text": "راهبرد تجربه (Experience Strategy): تدوین چارچوب‌ها، مؤلفه‌ها و ویژگی‌های متمایز راهبردهای تجربه‌ی مشتری و ارتباط آن‌ها با راهبردهای کسب‌وکار، اهداف و نتایج کلیدی (OKRs) و شاخص‌های کلیدی عملکرد (KPIs) زیربنایی.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 5
    },
    {
      "id": "behavior",
      "type": "radio",
      "guide": true,
      "text": "رفتار و تصمیم‌گیری مصرف‌کننده (Consumer Behavior and Decision-Making): تلاش برای درک و کاربست اصول تصمیم‌گیری و تحلیل رفتار در گروه‌های متنوع ذی‌نفعان، به‌گونه‌ای که راه‌حل‌ها نیازهای کارکردی، عاطفی و اجتماعی را در بسترهای گوناگون پاسخ دهند.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 6
    },
    {
      "id": "qualitative",
      "type": "radio",
      "guide": true,
      "text": "تحقیق و تحلیل کیفی (Qualitative Research & Analysis): توسعه و به‌کارگیری فنون تحقیق کیفی برای کشف نیازها، انتظارات و تجربه‌های ظریف ذی‌نفعان و تبدیل بینش‌ها به راهبردهای عملیاتی.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 7
    },
    {
      "id": "analytics",
      "type": "radio",
      "guide": true,
      "text": "تحلیل تجربه (Experience Analytics): تحلیل و بهینه‌سازی فرایندها، رفتارها و سامانه‌هایی که بر تجربه‌ی ذی‌نفعان اثر می‌گذارند، با رویکردهای داده‌محور برای شناسایی و رفع موانع موفقیت.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 8
    },
    {
      "id": "human_design",
      "type": "radio",
      "guide": true,
      "text": "طراحی انسان‌محور و نوآوری (Human-Centered Design and Innovation): پرورش خلاقیت و راه‌حل‌های طراحی عادلانه، فراگیر و متناسب با ذی‌نفعان متنوع، برای اطمینان از تجربه‌های معنادار و اثرگذار.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 9
    },
    {
      "id": "design",
      "type": "radio",
      "guide": true,
      "text": "طراحی تجربه (Experience Design): خلق تجربه‌های منسجم و اثرگذار در نقاط تماس فیزیکی، دیجیتال و ترکیبی، با بهره‌گیری از ابزارهایی مانند پرسونا (Persona)، نقشه‌ی سفر (Journey Map) و روش‌های طراحی خدمت (Service Design).",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 10
    },
    {
      "id": "digital",
      "type": "radio",
      "guide": true,
      "text": "مدیریت تجربه‌ی دیجیتال مشتری (Digital Customer Experience Management): طراحی و مدیریت تعاملات دیجیتال که مشارکت، دسترس‌پذیری و رضایت ذی‌نفعان را ارتقا می‌دهد و در محیطی دیجیتال‌محور به موفقیت سازمان کمک می‌کند.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 11
    },
    {
      "id": "employee_experience",
      "type": "radio",
      "guide": true,
      "text": "مدیریت تجربه‌ی کارکنان (Employee Experience Management): توسعه‌ی سامانه‌ها و راهبردهایی که از بهزیستی همه‌جانبه و موفقیت کارکنان در طول سفر سازمانی آنان پشتیبانی می‌کند.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 12
    },
    {
      "id": "engagement",
      "type": "radio",
      "guide": true,
      "text": "مشارکت کارکنان (Employee Engagement): طراحی برنامه‌ها و راهبردهایی که مشارکت، انگیزه و حس تعلق همه‌ی کارکنان را از طریق تقویت پیوند آنان با مأموریت و اهداف سازمان پرورش می‌دهد.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 13
    },
    {
      "id": "crm",
      "type": "radio",
      "guide": true,
      "text": "مدیریت ارتباط با مشتری (Customer Relationship Management – CRM): پرورش و حفظ روابط بلندمدت و دوسویه‌سود با ذی‌نفعان از طریق پاسخ به نیازها و آرمان‌های در حال تحول آنان.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 14
    },
    {
      "id": "measurement",
      "type": "radio",
      "guide": true,
      "text": "سنجش تجربه و عملکرد (Measuring Experience and Performance): تعریف، سنجش و تحلیل شاخص‌های کلیدی عملکرد و پیامدهای مرتبط با تجربه‌ی ذی‌نفعان، برای امکان‌پذیر کردن بهبودهای داده‌محور که انتظارات را برآورده و فراتر از آن عمل می‌کند.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 15
    },
    {
      "id": "quantitative",
      "type": "radio",
      "guide": true,
      "text": "تحلیل و مصورسازی داده‌های کمّی (Quantitative Data Analysis and Visualization): گردآوری، تحلیل و مصورسازی داده‌ها از منابع متعدد برای ارائه‌ی بینش‌های عملیاتی که تصمیم‌گیری را آگاه می‌کند و تجربه‌ی ذی‌نفعان را ارتقا می‌بخشد.",
      "options": [
        "در دستور کار نیست / بررسی نمی‌شود",
        "در حال بررسی، اما هنوز پیاده‌سازی نشده (Considering)",
        "اولیه / مقطعی (Initial / Ad hoc)",
        "در حال توسعه (Developing)",
        "تعریف‌شده و مدیریت‌شده (Defined and managed)",
        "بهینه‌شونده (Optimizing)"
      ],
      "number": 16
    },
    {
      "id": "important",
      "type": "rank",
      "text": "لطفاً سه شایستگی «مهم‌ترین» برای مدیریت تجربه (XM) کلیِ سازمان خود را رتبه‌بندی کنید.",
      "hint": "رتبهٔ ۱: مهم‌ترین؛ رتبهٔ ۲: دومین؛ رتبهٔ ۳: سومین. سه شایستگی متفاوت انتخاب کنید.",
      "number": 17
    },
    {
      "id": "least",
      "type": "rank",
      "text": "لطفاً سه شایستگی «کم‌اهمیت‌ترین» برای مدیریت تجربه (XM) کلیِ سازمان خود را رتبه‌بندی کنید.",
      "hint": "رتبهٔ ۱: کم‌اهمیت‌ترین؛ رتبهٔ ۲: دومین؛ رتبهٔ ۳: سومین. سه شایستگی متفاوت انتخاب کنید.",
      "number": 18
    },
    {
      "id": "success",
      "type": "textarea",
      "text": "مهم‌ترین عوامل موفقیت سازمان شما در پیشبرد شایستگی‌های مدیریت تجربه (XM) چه بوده است؟",
      "number": 19
    },
    {
      "id": "challenges_text",
      "type": "textarea",
      "text": "مهم‌ترین چالش‌های سازمان شما در پیشبرد شایستگی‌های مدیریت تجربه (XM) چیست؟",
      "number": 20
    },
    {
      "id": "challenges",
      "type": "check3",
      "text": "از میان ۱۵ شایستگی، ۳ مورد را که چالش شماست انتخاب کنید.",
      "number": 21
    }
  ]
};
