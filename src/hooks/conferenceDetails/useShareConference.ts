// hooks/useShareConference.ts
import { ConferenceResponse } from '../../models/response/conference.response'; // Adjust path

const useShareConference = (conferenceData: ConferenceResponse | null) => {

  const handleShareClick = (platform: 'facebook' | 'twitter' | 'reddit') => {
    if (!conferenceData) return;


    const location = conferenceData.organizations[0].locations[0];
    const organization = conferenceData.organizations[0];
    const conference = conferenceData;
    const conferenceDate =conferenceData.organizations[0].conferenceDates.find(date => date?.type === 'conferenceDates');
    const fromDateStr = conferenceDate?.fromDate ?? '';
    const toDateStr = conferenceDate?.toDate ?? '';

    const fromDateFormatted = fromDateStr ? new Date(fromDateStr).toLocaleDateString() : 'N/A';
    const toDateFormatted = toDateStr ? new Date(toDateStr).toLocaleDateString() : 'N/A';

    const shareText = `📢 ${conferenceData.title}\n📅 Thời gian: ${fromDateFormatted} - ${toDateFormatted} \n📍 Địa điểm: ${location?.cityStateProvince}, ${location?.country}\n🔗 Chi tiết: ${organization.link}`;
    const shareUrl = encodeURIComponent(organization.link || window.location.href);
    const encodedText = encodeURIComponent(shareText);

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'reddit':
        shareLink = `https://www.reddit.com/submit?url=${shareUrl}&title=${encodedText}`;
        break;
      default:
        console.error('Unsupported platform');
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  return { handleShareClick };
}

export default useShareConference;