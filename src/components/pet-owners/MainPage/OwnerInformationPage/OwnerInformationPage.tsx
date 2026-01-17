'use client';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Container,
  TopHeader,
  BackButton,
  PageTitle,
  Header,
  Divider,
  AvatarWrapper,
  AvatarImg,
  OwnerName,
  OwnerId,
  Section,
  SectionHeader,
  SectionTitle,
  EditLink,
  InfoList,
  InfoItem,
  InfoLabel,
  InfoValue
} from '../../../../styles/OwnerInformationPage.styles';

const OwnerInformationPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use mock data instead of API call
        const { mockUserProfile } = await import('@/mocks/owner');
        setUserData(mockUserProfile);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <Container>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </Container>
    );
  }

  if (error || !userData) {
    return (
      <Container>
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          {error || 'No user data available'}
        </div>
      </Container>
    );
  }

  const displayName = `${userData.fname || ''} ${userData.lname || ''}`.trim() || 'Unknown User';
  const userId = userData.id || 'N/A';

  return (
    <Container>
      <TopHeader>
        <BackButton onClick={() => router.back()} aria-label="back">
          <ArrowBackIosNewIcon />
        </BackButton>
        <PageTitle>Owner Information</PageTitle>
      </TopHeader>
      <Header>
        <AvatarWrapper>
          <AvatarImg
            src={userData.picture_url || "/images/profile-test.png"}
            alt="Owner Avatar"
            width={50}
            height={50}
          />
        </AvatarWrapper>
        <div>
          <OwnerName>{displayName}</OwnerName>
          <OwnerId>ID: {userId.substring(userId.length - 9)}</OwnerId>
        </div>
      </Header>
      <Divider />
      <Section>
        <SectionHeader>
          <SectionTitle>
            <InfoOutlinedIcon />
            Basic Information
          </SectionTitle>
          <EditLink onClick={() => router.push('/pet-owners/owner-info-page/edit')}>Edit</EditLink>
        </SectionHeader>
        <InfoList>
          <InfoItem>
            <InfoLabel>First Name</InfoLabel>
            <InfoValue>{userData.fname || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Last Name</InfoLabel>
            <InfoValue>{userData.lname || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Gender</InfoLabel>
            <InfoValue>{userData.contact?.gender || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Phone</InfoLabel>
            <InfoValue>{userData.contact?.phone || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>{userData.contact?.email || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Line ID</InfoLabel>
            <InfoValue>{userData.line_id || 'N/A'}</InfoValue>
          </InfoItem>
        </InfoList>
      </Section>
    </Container>
  );
};

export default OwnerInformationPage;
