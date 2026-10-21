import hand from '../assets/illustration/hand.svg';
import mobile from '../assets/illustration/mobile.svg';
import group from '../assets/illustration/group.svg';
import vector from '../assets/illustration/vector.svg';
import { assets } from './icons';
import { Alert, Divider } from './ui';

/** "Assistant" illustration (Streamline Brooklyn), composed from its four exported layers. */
function Illustration() {
  return (
    <div className="illustration">
      <div className="illustration__art" role="img" aria-label="A hand holding a phone and scanning">
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
  return (
    <div className="instructions-card">
      <Illustration />
      <section className="instructions" aria-labelledby="instructions-title">
        <h2 id="instructions-title" className="instructions__title">Instructions</h2>
        <Divider />
        <div className="stepper">
          <img src={assets.inbox} alt="" />
          <span className="stepper__num">1.</span>
          <p className="stepper__text">
            Pack products by type
            <br />
            <span className="stepper__sub">Frozen, Fresh, or Normal</span>
          </p>
        </div>
        <div className="stepper">
          <img src={assets.maximize} alt="" />
          <span className="stepper__num">2</span>
          <p className="stepper__text">Scan the shelf location</p>
        </div>
        <div className="stepper">
          <img src={assets.bagStep} alt="" />
          <span className="stepper__num">3</span>
          <p className="stepper__text">Scan bags and place them in the scanned location</p>
        </div>
        <Alert variant="warning" title="No more space in the same location?">
          Scan the new location, gather any leftover bags, scan them and place them
        </Alert>
      </section>
    </div>
  );
}
