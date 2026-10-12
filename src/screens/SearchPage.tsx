import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface SearchPageProps {
  navigation: any;
}

const SearchPage: React.FC<SearchPageProps> = ({ navigation }) => {
  return (
    <PlaceholderPage
      pageTitle="Search"
      pageName="search"
      componentName="SearchPage"
      description="Full-text search across movies and live channels with real-time results, filter chips (Movies, Live, Series), and recent searches history stored locally."
      suggestedPrompt="Build a Search page for Arshia TV that provides real-time search across movies and live channels, displays results in a mixed card grid (movies show poster, live channels show logo), includes filter chips to narrow by content type (Movies, Live TV, Series), shows a 'Recent Searches' list using AsyncStorage, and highlights matched text in result titles."
    />
  );
};

export default SearchPage;
