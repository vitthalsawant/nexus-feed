import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalFeed } from './GlobalFeed';
import { PersonalizedFeed } from './PersonalizedFeed';

export const FeedTabs = () => {
  return (
    <Tabs defaultValue="global" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="global">Global Feed</TabsTrigger>
        <TabsTrigger value="personalized">For You</TabsTrigger>
      </TabsList>
      
      <TabsContent value="global" className="mt-6">
        <GlobalFeed />
      </TabsContent>
      
      <TabsContent value="personalized" className="mt-6">
        <PersonalizedFeed />
      </TabsContent>
    </Tabs>
  );
};