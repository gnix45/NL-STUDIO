import { IconPaintbrush, IconLayers, IconMonitor, IconSend } from '@/components/icons'

const steps = [
  {
    num: '01',
    icon: IconPaintbrush,
    title: 'Decouverte',
    description: 'Comprendre votre marque, vos objectifs et votre audience pour definir la direction creative.',
  },
  {
    num: '02',
    icon: IconLayers,
    title: 'Conception',
    description: 'Exploration visuelle et creation de concepts uniques alignes avec votre vision.',
  },
  {
    num: '03',
    icon: IconMonitor,
    title: 'Realisation',
    description: 'Developpement des livrables finaux avec precision et attention aux details.',
  },
  {
    num: '04',
    icon: IconSend,
    title: 'Livraison',
    description: 'Remise des fichiers dans tous les formats necessaires, prets a utiliser.',
  },
]

export function WorkflowSection() {
  return (
    <section
      style={{
        background: '#0C0C0C',
        padding: 'clamp(60px, 8vw, 120px) clamp(24px, 5vw, 80px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <span
          className="text-label"
          style={{ color: '#D42B2B', display: 'block', marginBottom: '16px' }}
        >
          PROCESSUS
        </span>
        <h2
          className="font-display text-display-md"
          style={{ color: '#F8F7F4', margin: '0 0 clamp(40px, 5vw, 64px)' }}
        >
          Comment on travaille
        </h2>

        <div className="workflow-grid">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.num}
                className="hover-border-bottom"
                style={{
                  padding: 'clamp(24px, 3vw, 40px)',
                  background: 'rgba(248, 247, 244, 0.03)',
                  position: 'relative',
                  transition: 'background 0.3s ease',
                }}
              >
                {/* Step number */}
                <span
                  className="font-display"
                  style={{
                    color: 'rgba(248, 247, 244, 0.15)',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    display: 'block',
                    marginBottom: '20px',
                    lineHeight: 1,
                  }}
                >
                  {step.num}
                </span>

                {/* Icon in red square */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: '#D42B2B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <Icon size={22} color="#F8F7F4" />
                </div>

                {/* Title */}
                <h3
                  className="font-display"
                  style={{
                    color: '#F8F7F4',
                    fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                    margin: '0 0 12px',
                    fontWeight: 700,
                  }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    color: '#6B6B6B',
                    fontSize: 'clamp(0.8rem, 0.9vw, 0.9rem)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
