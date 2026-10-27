export type Classification = 'Public' | 'Confidential' | 'Restricted';
export type AssetStatus = 'Draft' | 'Reviewed' | 'Approved' | 'Published';

export interface DataAsset {
  id: string;
  nameEn: string;
  nameAr: string;
  classification: Classification;
  qualityScore: number;
  status: AssetStatus;
  owner: string;
  lastUpdated: string;
  descriptionEn: string;
  descriptionAr: string;
  pipelineStepsCompleted: number;
}

export const PIPELINE_STEPS = [
  { en: 'Classification', ar: 'التصنيف' },
  { en: 'Privacy & Security Review', ar: 'مراجعة الخصوصية والأمان' },
  { en: 'Quality Scoring', ar: 'تقييم الجودة' },
  { en: 'Use-case Discovery', ar: 'اكتشاف حالات الاستخدام' },
  { en: 'Transformation', ar: 'التحويل' },
  { en: 'Legal & Governance Approval', ar: 'الموافقة القانونية والحوكمة' },
  { en: 'Publish & Access Policy', ar: 'النشر وسياسة الوصول' },
];

export const DEMO_ASSETS: DataAsset[] = [
  {
    id: '1',
    nameEn: 'Public Transport Ridership',
    nameAr: 'بيانات ركاب المواصلات العامة',
    classification: 'Public',
    qualityScore: 91,
    status: 'Published',
    owner: 'Ahmed Al Mansouri',
    lastUpdated: '2026-10-20',
    descriptionEn: 'Daily ridership counts across all metro, bus, and tram lines.',
    descriptionAr: 'أعداد الركاب اليومية عبر جميع خطوط المترو والحافلات والترام.',
    pipelineStepsCompleted: 7,
  },
  {
    id: '2',
    nameEn: 'Water Consumption Index',
    nameAr: 'مؤشر استهلاك المياه',
    classification: 'Confidential',
    qualityScore: 78,
    status: 'Approved',
    owner: 'Sara Al Hashimi',
    lastUpdated: '2026-10-15',
    descriptionEn: 'Monthly water consumption per district, aggregated and anonymised.',
    descriptionAr: 'استهلاك المياه الشهري لكل منطقة، مجمّع ومجهول الهوية.',
    pipelineStepsCompleted: 6,
  },
  {
    id: '3',
    nameEn: 'Business Licence Registry',
    nameAr: 'سجل التراخيص التجارية',
    classification: 'Public',
    qualityScore: 85,
    status: 'Published',
    owner: 'Khalid Al Nuaimi',
    lastUpdated: '2026-10-18',
    descriptionEn: 'Active business licences by sector, emirate, and activity type.',
    descriptionAr: 'التراخيص التجارية النشطة حسب القطاع والإمارة ونوع النشاط.',
    pipelineStepsCompleted: 7,
  },
  {
    id: '4',
    nameEn: 'Healthcare Utilisation',
    nameAr: 'بيانات استخدام الرعاية الصحية',
    classification: 'Restricted',
    qualityScore: 62,
    status: 'Reviewed',
    owner: 'Fatima Al Zaabi',
    lastUpdated: '2026-10-10',
    descriptionEn: 'Aggregated outpatient and emergency visits by facility type.',
    descriptionAr: 'زيارات العيادات الخارجية والطوارئ المجمّعة حسب نوع المنشأة.',
    pipelineStepsCompleted: 3,
  },
  {
    id: '5',
    nameEn: 'Renewable Energy Output',
    nameAr: 'إنتاج الطاقة المتجددة',
    classification: 'Public',
    qualityScore: 88,
    status: 'Approved',
    owner: 'Omar Al Rashidi',
    lastUpdated: '2026-10-12',
    descriptionEn: 'Hourly solar and wind generation from UAE grid assets.',
    descriptionAr: 'إنتاج الطاقة الشمسية وطاقة الرياح بالساعة من أصول الشبكة الإماراتية.',
    pipelineStepsCompleted: 6,
  },
  {
    id: '6',
    nameEn: 'Real Estate Transactions',
    nameAr: 'المعاملات العقارية',
    classification: 'Public',
    qualityScore: 74,
    status: 'Published',
    owner: 'Noor Al Marzouqi',
    lastUpdated: '2026-10-22',
    descriptionEn: 'Residential and commercial property sales by area and price band.',
    descriptionAr: 'مبيعات العقارات السكنية والتجارية حسب المنطقة وشريحة الأسعار.',
    pipelineStepsCompleted: 7,
  },
  {
    id: '7',
    nameEn: 'Port Cargo Volumes',
    nameAr: 'أحجام الشحن في الموانئ',
    classification: 'Confidential',
    qualityScore: 55,
    status: 'Draft',
    owner: 'Hamad Al Dhaheri',
    lastUpdated: '2026-10-05',
    descriptionEn: 'Container and bulk cargo throughput across major UAE ports.',
    descriptionAr: 'إنتاجية الحاويات والبضائع السائبة عبر الموانئ الرئيسية في الإمارات.',
    pipelineStepsCompleted: 2,
  },
  {
    id: '8',
    nameEn: 'Tourism Arrival Statistics',
    nameAr: 'إحصائيات قدوم السياح',
    classification: 'Public',
    qualityScore: 82,
    status: 'Reviewed',
    owner: 'Layla Al Suwaidi',
    lastUpdated: '2026-10-17',
    descriptionEn: 'International and domestic visitor counts by nationality and season.',
    descriptionAr: 'أعداد الزوار الدوليين والمحليين حسب الجنسية والموسم.',
    pipelineStepsCompleted: 4,
  },
];

export const RECENT_ACTIVITY = [
  { en: 'Public Transport Ridership published to data marketplace', ar: 'تم نشر بيانات ركاب المواصلات العامة في سوق البيانات', time: '2 hours ago | منذ ساعتين' },
  { en: 'Healthcare Utilisation moved to Reviewed status', ar: 'انتقلت بيانات استخدام الرعاية الصحية إلى حالة المراجعة', time: '5 hours ago | منذ 5 ساعات' },
  { en: 'Real Estate Transactions quality score updated to 74', ar: 'تم تحديث درجة جودة المعاملات العقارية إلى 74', time: 'Yesterday | أمس' },
  { en: 'Port Cargo Volumes classification set to Confidential', ar: 'تم تصنيف أحجام الشحن في الموانئ على أنها سرية', time: '2 days ago | منذ يومين' },
  { en: 'Tourism Arrival Statistics use-case discovery completed', ar: 'اكتمل اكتشاف حالات الاستخدام لإحصائيات قدوم السياح', time: '3 days ago | منذ 3 أيام' },
];
