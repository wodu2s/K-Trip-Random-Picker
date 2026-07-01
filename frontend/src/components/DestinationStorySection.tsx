import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { RecommendationType } from '../utils/recommendationType';
import { getDestinationStory } from '../utils/destinationContent';

interface Props {
  destination: Destination;
  prefs: TripFormState;
  recType: RecommendationType;
}

export default function DestinationStorySection({ destination, prefs, recType }: Props) {
  const story = getDestinationStory(destination, prefs, recType);
  // 3문장까지만 표시
  const shortStory = story.split('.').filter(Boolean).slice(0, 3).join('.') + '.';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <p className="text-slate-600 font-medium leading-relaxed text-sm">
        {shortStory}
      </p>
    </div>
  );
}
