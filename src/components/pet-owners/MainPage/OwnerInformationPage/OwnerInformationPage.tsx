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
} from '@/styles/components/owner-information.styled';
import { getUserProfile, authStorage } from '@/services/api/client';
import SectionError from "@/components/pet-owners/shared/SectionError";
import { Profile } from '@/components/shared';

const DEFAULT_OWNER_PROFILE_IMAGE = '/Ava.svg';

const DefaultImage = 'https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/blank_pet_owner_profile_1x.webp';

const OwnerInformationPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<import('@/types/domain/user').UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authStorage.getToken() || "";
      const data = await getUserProfile(token);
      setUserData(data);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  if (loading && !userData) {
    return (
      <Container>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </Container>
    );
  }

  // Removed blocking error return
  // if (error || !userData) return ...

  const displayName = userData ? `${userData.fname || ''} ${userData.lname || ''}`.trim() : 'Unknown User';
  const userId = userData?.user_id || 'N/A';

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
          <Profile
            alt={displayName}
            imageUrl={userData?.picture_url}
            size="48px"
          />
        </AvatarWrapper>
        <div>
          <OwnerName>{displayName}</OwnerName>
          <OwnerId>ID: {userId}</OwnerId>
        </div>
      </Header>
      <Divider />

      {error && !userData ? (
        <div className="p-4">
          <SectionError message={error} onRetry={fetchUserData} />
        </div>
      ) : (
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
              <InfoValue>{userData?.fname || 'N/A'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Last Name</InfoLabel>
              <InfoValue>{userData?.lname || 'N/A'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Gender</InfoLabel>
              <InfoValue>{userData?.gender || 'N/A'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Phone</InfoLabel>
              <InfoValue>{userData?.phone || 'N/A'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Email</InfoLabel>
              <InfoValue>{userData?.email || 'N/A'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Line ID</InfoLabel>
              <InfoValue>{userData?.line_id || 'N/A'}</InfoValue>
            </InfoItem>
          </InfoList>
        </Section>
      )}
    </Container>
  );
};


export default OwnerInformationPage;
