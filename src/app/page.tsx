import { createServiceRoleClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { AboutSection } from '@/components/landing/AboutSection'
import { WorkflowSection } from '@/components/landing/WorkflowSection'
import { WorksSection } from '@/components/landing/WorksSection'
import { ContactSection } from '@/components/landing/ContactSection'
import { FooterSection } from '@/components/landing/FooterSection'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export const revalidate = 60

// Default content fallbacks when DB is unavailable
const defaults: Record<string, Record<string, string>> = {
  hero: {
    tagline: 'DESIGN & BRANDING STUDIO',
    title_line1: 'Nous créons des',
    title_line2: 'identités',
    title_line3: 'visuelles uniques',
    subtitle: 'Studio de design graphique spécialisé en branding, direction artistique et solutions visuelles sur mesure.',
    stat_projects: '50+',
    stat_years: '5+',
    stat_clients: '30+',
    stat_passion: '100%',
  },
  about: {
    label: 'A PROPOS',
    title: 'Un regard créatif sur chaque projet',
    paragraph1: 'NL.studio est un studio de design visuel fondé sur la conviction que chaque marque mérite une identité forte et mémorable. Nous créons des solutions visuelles qui racontent votre histoire.',
    paragraph2: 'Notre approche combine rigueur stratégique et sensibilité artistique pour livrer des résultats qui dépassent les attentes.',
    quote: '"Le design est la méthode silencieuse de parler à votre audience."',
  },
  contact: {
    title: 'Discutons de votre projet',
    whatsapp: '+237691239985',
    instagram: 'https://instagram.com/nl.studio',
    behance: 'https://behance.net/nlstudio',
    email: 'tectrib@gmail.com',
  },
  store: {
    title: 'Boutique',
    subtitle: 'Ressources et templates premium pour vos projets créatifs.',
  },
}

async function getPageContent(): Promise<Record<string, Record<string, string>>> {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('page_content')
      .select('section, key, value')

    if (error || !data || data.length === 0) {
      return defaults
    }

    const content: Record<string, Record<string, string>> = { ...defaults }
    for (const row of data) {
      if (!content[row.section]) content[row.section] = {}
      content[row.section][row.key] = row.value
    }
    return content
  } catch {
    return defaults
  }
}

export default async function HomePage() {
  const content = await getPageContent()

  return (
    <>
      <Navbar />
      <main>
        <HeroSection content={content.hero} />
        <AboutSection content={content.about} />
        <WorkflowSection />
        <WorksSection />
        <ContactSection content={content.contact} />
      </main>
      <FooterSection />
      <WhatsAppButton phone={content.contact?.whatsapp || '+237691239985'} />
    </>
  )
}
