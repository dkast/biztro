import { Sparkles, Upload, Zap } from "lucide-react"

import Features from "@/components/flare-ui/features-horizontal"
import TitleSection from "@/components/marketing/title-section"

const data = [
  {
    id: 1,
    title: "1. Upload Your Data",
    content:
      "Simply upload your data to our secure platform. We support various file formats and data types to ensure a seamless integration with your existing systems.",
    image: "/configuration.png",
    icon: <Upload className="text-primary h-6 w-6" />
  },
  {
    id: 2,
    title: "2. Click Start",
    content:
      "Our advanced AI algorithms automatically process and analyze your data, extracting valuable insights and patterns that would be difficult to identify manually.",
    image: "/products.png",
    icon: <Zap className="text-primary h-6 w-6" />
  },
  {
    id: 3,
    title: "3. Get Actionable Insights",
    content:
      "Receive clear, actionable insights and recommendations based on the AI analysis. Use these insights to make data-driven decisions and improve your business strategies.",
    image: "/editor.png",
    icon: <Sparkles className="text-primary h-6 w-6" />
  }
]

export default function Component() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-28 pt-20 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8">
      <TitleSection eyebrow="How It Works" title="Our Simple Process" />
      <Features collapseDelay={8000} data={data} linePosition="bottom" />
    </section>
  )
}
