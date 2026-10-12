import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface SeriesPageProps {
  navigation: any;
}

const SeriesPage: React.FC<SeriesPageProps> = ({ navigation }) => {
  return (
    <PlaceholderPage
      pageTitle="Series"
      pageName="series"
      componentName="SeriesPage"
      description="Iranian and international TV series browser with season/episode collapsible lists, episode thumbnails, and the Arshia TV animated watermark in the video player."
      suggestedPrompt="Build a TV Series page for Arshia TV showing a stylish poster grid of Iranian and international series. Tapping a series opens a detail screen with collapsible season accordions listing episodes with thumbnails and duration. Playing an episode launches the video player with the animated Arshia TV moving logo overlay at the top-right. Include a 'Continue Watching' row at the top that tracks progress via AsyncStorage."
    />
  );
};

export default SeriesPage;
