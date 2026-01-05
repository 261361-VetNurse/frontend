'use client';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useRouter } from 'next/navigation';
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
          <AvatarImg src="/images/profile-test.png" alt="Owner Avatar" width={50} height={50} />
        </AvatarWrapper>
        <div>
          <OwnerName>Y JH</OwnerName>
          <OwnerId>ID: 098765345</OwnerId>
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
            <InfoValue>JH</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Last Name</InfoLabel>
            <InfoValue>Yoon</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Gender</InfoLabel>
            <InfoValue>Male</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Phone</InfoLabel>
            <InfoValue>0123456789</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>YJH@gmail.com</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Line ID</InfoLabel>
            <InfoValue>YJH1004</InfoValue>
          </InfoItem>
        </InfoList>
      </Section>
    </Container>
  );
};

export default OwnerInformationPage;
