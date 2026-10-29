import hand from '../assets/illustration/hand.svg';
import mobile from '../assets/illustration/mobile.svg';
import group from '../assets/illustration/group.svg';
import vector from '../assets/illustration/vector.svg';
import { assets } from './icons';
import { useI18n } from '../i18n';
import { Alert, Divider } from './ui';

/** "Assistant" illustration (Streamline Brooklyn), composed from its four exported layers. */
function Illustration() {
  const { t } = useI18n();
  return (
    <div className="illustration" dir="ltr">
      <div className="illustration__art" role="img" aria-label={t('illustrationAlt')}>
        <div className="illustration__layer illustration__layer--hand"><img src={hand} alt="" /></div>
        <div className="illustration__layer illustration__layer--mobile"><img src={mobile} alt="" /></div>
        <div className="illustration__layer illustration__layer--group"><img src={group} alt="" /></div>
        <div className="illustration__layer illustration__layer--vector">
          <div><img src={vector} alt="" style={{ position: 'absolute', inset: 0 }} /></div>
        </div>
      </div>
    </div>
  );
}

export function InstructionsCard() {
  const { t } = useI18n();
  return (
    <div className="instructions-card">
      <Illustration />
      <section className="instructions" aria-labelledby="instructions-title">
        <h2 id="instructions-title" className="instructions__title">{t('instructions')}</h2>
        <Divider />
        <div className="stepper">
          <img src={assets.inbox} alt="" />
          <span className="stepper__num">1.</span>
          <p className="stepper__text">
            {t('step1')}
            <br />
            <span className="stepper__sub">{t('step1Sub')}</span>
          </p>
        </div>
        <div className="stepper">
          <img src={assets.maximize} alt="" />
          <span className="stepper__num">2</span>
          <p className="stepper__text">{t('step2')}</p>
        </div>
        <div className="stepper">
          <img src={assets.bagStep} alt="" />
          <span className="stepper__num">3</span>
          <p className="stepper__text">{t('step3')}</p>
        </div>
        <Alert variant="warning" title={t('noSpaceTitle')}>
          {t('noSpaceBody')}
        </Alert>
      </section>
    </div>
  );
}
