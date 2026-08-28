// Nội dung tĩnh 100% cho trang "Giới thiệu" (/gioi-thieu) - KHÔNG gọi backend/database. Trang này kể
// câu chuyện thương hiệu (Cloudverse là gì/vì sao ra đời/giá trị/tầm nhìn), khác trang chủ (bán sản
// phẩm) nên không cần dữ liệu động - nội dung ở đây thay đổi rất hiếm, chỉnh trực tiếp trong file này.

export const ABOUT_HERO = {
  label: "GIỚI THIỆU CLOUDVERSE",
  heading: ["Chúng tôi xây dựng", "hạ tầng cho thế giới số."],
  description:
    "Cloudverse hướng đến việc đơn giản hóa hạ tầng số, giúp cá nhân, nhà phát triển và doanh nghiệp có một nền tảng đáng tin cậy để xây dựng và phát triển sản phẩm của mình.",
};

export const ABOUT_WHAT_IS = {
  heading: "Cloudverse là gì?",
  paragraphs: [
    "Cloudverse là nền tảng cung cấp các giải pháp hạ tầng số, được xây dựng với định hướng giúp việc triển khai và vận hành các hệ thống trực tuyến trở nên đơn giản, linh hoạt và dễ tiếp cận hơn.",
    "Thay vì phải đối mặt với sự phức tạp của hạ tầng, người dùng có thể tập trung nhiều hơn vào sản phẩm, ứng dụng và những giá trị mà họ muốn tạo ra.",
  ],
  flow: [
    { label: "Ý tưởng" },
    { label: "Hạ tầng" },
    { label: "Ứng dụng" },
    { label: "Thế giới số" },
  ],
};

export const ABOUT_WHY = {
  heading: "Vì sao Cloudverse ra đời?",
  paragraphs: [
    "Khi công nghệ phát triển, hạ tầng số trở thành nền móng của ngày càng nhiều sản phẩm và hoạt động kinh doanh.",
    "Tuy nhiên, việc tiếp cận, triển khai và quản lý hạ tầng vẫn có thể trở nên phức tạp đối với nhiều cá nhân, nhà phát triển và doanh nghiệp.",
    "Cloudverse được định hướng để thu hẹp khoảng cách đó — mang đến một trải nghiệm hạ tầng đơn giản hơn, rõ ràng hơn và phù hợp hơn với nhu cầu thực tế.",
  ],
  flow: [
    { label: "Phức tạp" },
    { label: "Cấu hình" },
    { label: "Vận hành" },
    { label: "Cloudverse" },
    { label: "Trải nghiệm đơn giản hơn" },
  ],
};

// Năm/nội dung dưới đây là NỘI DUNG MẪU tĩnh - chỉnh trực tiếp tại đây nếu mốc thời gian thực tế của
// Cloudverse khác. Không có backend/CMS đứng sau, đổi timeline nghĩa là sửa file này rồi deploy lại.
export const ABOUT_TIMELINE = [
  {
    year: "2024",
    title: "Khởi đầu",
    description: "Ý tưởng về Cloudverse bắt đầu được hình thành.",
  },
  {
    year: "2025",
    title: "Đặt nền móng",
    description: "Tập trung xây dựng nền tảng và định hướng phát triển hệ sinh thái.",
  },
  {
    year: "2026",
    title: "Mở rộng",
    description: "Tiếp tục hoàn thiện trải nghiệm và mở rộng khả năng phục vụ người dùng.",
  },
];

export const ABOUT_MISSION = {
  heading: "Sứ mệnh",
  statement: "Đơn giản hóa hạ tầng số để nhiều người hơn có thể xây dựng, triển khai và phát triển sản phẩm công nghệ của mình.",
};

export const ABOUT_VISION = {
  heading: "Tầm nhìn",
  statement:
    "Trở thành một nền tảng hạ tầng số đáng tin cậy, nơi cá nhân và doanh nghiệp có thể tìm thấy những công cụ cần thiết để xây dựng và phát triển trong thế giới số.",
};

export const ABOUT_CORE_VALUES = {
  heading: "Giá trị cốt lõi",
  subheading: "Những nguyên tắc định hình cách Cloudverse xây dựng sản phẩm và phục vụ người dùng.",
  values: [
    {
      iconKey: "shield-check",
      title: "Tin cậy",
      description: "Hạ tầng cần phải đáng tin cậy, bởi phía sau mỗi hệ thống là dữ liệu, công việc và trải nghiệm của người dùng.",
    },
    {
      iconKey: "sparkle",
      title: "Đơn giản",
      description: "Công nghệ mạnh mẽ không nhất thiết phải đi kèm với sự phức tạp.",
    },
    {
      iconKey: "eye",
      title: "Minh bạch",
      description: "Thông tin rõ ràng giúp người dùng đưa ra quyết định tốt hơn.",
    },
    {
      iconKey: "lock",
      title: "Bảo mật",
      description: "An toàn dữ liệu và hệ thống là một phần không thể tách rời của hạ tầng số.",
    },
    {
      iconKey: "lightbulb",
      title: "Đổi mới",
      description: "Không ngừng tìm kiếm những cách tốt hơn để giải quyết các vấn đề thực tế.",
    },
    {
      iconKey: "handshake",
      title: "Đồng hành",
      description: "Cloudverse không chỉ cung cấp công nghệ mà hướng đến việc đồng hành cùng người dùng trên hành trình phát triển.",
    },
  ],
};

export const ABOUT_AUDIENCE = {
  heading: "Cloudverse dành cho ai?",
  groups: [
    {
      iconKey: "user",
      title: "Cá nhân",
      description: "Những người muốn xây dựng website, blog hoặc dự án cá nhân.",
    },
    {
      iconKey: "code",
      title: "Nhà phát triển",
      description: "Những người cần môi trường để triển khai ứng dụng và thử nghiệm ý tưởng.",
    },
    {
      iconKey: "buildings",
      title: "Doanh nghiệp",
      description: "Những tổ chức cần nền tảng hạ tầng để vận hành và phát triển hệ thống số.",
    },
  ],
};

export const ABOUT_ECOSYSTEM = {
  heading: ["Một hệ sinh thái", "cho hạ tầng số"],
  description:
    "Cloudverse hướng đến việc xây dựng một hệ sinh thái nơi các nhu cầu khác nhau về hạ tầng số có thể được tiếp cận trong một trải nghiệm thống nhất.",
  items: [
    { iconKey: "cloud", name: "Cloud", description: "Hạ tầng điện toán đám mây linh hoạt." },
    { iconKey: "cpu", name: "VPS", description: "Máy chủ ảo riêng, toàn quyền quản trị." },
    { iconKey: "hard-drives", name: "Hosting", description: "Không gian lưu trữ cho website." },
    { iconKey: "at", name: "Domain", description: "Tên miền cho định danh trực tuyến." },
    { iconKey: "lock-key", name: "SSL", description: "Chứng chỉ bảo mật kết nối." },
    { iconKey: "cloud-arrow-up", name: "Backup", description: "Sao lưu dữ liệu định kỳ." },
    { iconKey: "shield-check", name: "Security", description: "Các lớp bảo vệ hạ tầng." },
  ],
  ctaLabel: "Khám phá hệ sinh thái",
  ctaHref: "/dich-vu",
};

export const ABOUT_APPROACH = {
  heading: "Xây dựng từ nhu cầu thực tế",
  steps: [
    { title: "Lắng nghe", description: "Hiểu nhu cầu thực tế." },
    { title: "Đơn giản hóa", description: "Loại bỏ những phức tạp không cần thiết." },
    { title: "Xây dựng", description: "Biến giải pháp thành sản phẩm." },
    { title: "Cải tiến", description: "Liên tục hoàn thiện trải nghiệm." },
  ],
};

export const ABOUT_PEOPLE = {
  heading: ["Đằng sau công nghệ", "là con người"],
  paragraphs: [
    "Công nghệ chỉ có ý nghĩa khi nó giải quyết được những vấn đề thực tế của con người.",
    "Cloudverse được xây dựng với tư duy lấy người dùng làm trung tâm — từ cách thiết kế sản phẩm, trải nghiệm quản lý đến cách chúng tôi tiếp cận những vấn đề về hạ tầng.",
  ],
};

export const ABOUT_FUTURE = {
  heading: ["Cloudverse", "đang hướng đến đâu?"],
  paragraphs: [
    "Thế giới số sẽ tiếp tục thay đổi.",
    "Những hệ thống ngày hôm nay có thể trở thành nền móng cho những sản phẩm lớn hơn trong tương lai.",
    "Cloudverse muốn tiếp tục phát triển theo hướng xây dựng một hệ sinh thái hạ tầng số đơn giản, linh hoạt và dễ tiếp cận hơn.",
  ],
  flow: [{ label: "Bắt đầu" }, { label: "Xây dựng" }, { label: "Phát triển" }, { label: "Tiếp theo" }],
};

export const ABOUT_CLOSING = {
  heading: ["Đây mới chỉ là", "khởi đầu."],
  paragraphs: [
    "Cloudverse vẫn đang trên hành trình xây dựng.",
    "Và chúng tôi tin rằng tương lai của hạ tầng số không chỉ nằm ở việc máy chủ mạnh đến đâu, mà còn ở việc công nghệ có thể trở nên đơn giản và hữu ích đến mức nào.",
  ],
  ctaLabel: "Khám phá Cloudverse",
  ctaHref: "/dich-vu",
};
