import { FaBrain, FaProjectDiagram, FaShieldAlt, FaChartLine, FaCogs } from "react-icons/fa";
import { SiLeetcode, SiTensorflow } from "react-icons/si";

const TRACK_CATALOG = [
  {
    key: "gate",
    title: "GATE",
    description: "Exam prep, topic deep dives, and peer support.",
    accent: "teal.500",
    icon: FaProjectDiagram,
  },
  {
    key: "dsa",
    title: "DSA",
    description: "Algorithms, data structures, and interview practice.",
    accent: "orange.400",
    icon: SiLeetcode,
  },
  {
    key: "machine-learning",
    title: "Machine Learning",
    description: "Modeling, projects, and practical ML workflows.",
    accent: "blue.500",
    icon: SiTensorflow,
  },
  {
    key: "data-science",
    title: "Data Science",
    description: "Analytics, data storytelling, and real datasets.",
    accent: "cyan.500",
    icon: FaChartLine,
  },
  {
    key: "artificial-intelligence",
    title: "Artificial Intelligence",
    description: "AI foundations, tools, and applied learning.",
    accent: "yellow.500",
    icon: FaBrain,
  },
  {
    key: "system-design",
    title: "System Design",
    description: "Architecture patterns and scaling strategies.",
    accent: "pink.400",
    icon: FaCogs,
  },
  {
    key: "cyber-security",
    title: "Cyber Security",
    description: "Security fundamentals and hands-on labs.",
    accent: "green.500",
    icon: FaShieldAlt,
  },
];

export default TRACK_CATALOG;
