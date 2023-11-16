import { getSession, signOut, useSession } from 'next-auth/react';
import React, { useState } from 'react';
import router from 'next/router';
import prisma from '@/lib/prismadb';
import HomeView from '@/components/HomeView';
import PetProfile from '@/components/PetProfile';

export async function getServerSideProps(context: any) {
  try {
    const session = await getSession(context);
    const currUser = session?.user;

    const user = await prisma.user.findFirst({
      where: { email: currUser?.email! },
    });

    const petProfile = await prisma.petProfile.findFirst({
      where: { userId: user?.id! },
      include: { image: {}, location: {} },
    });

    const petProfiles = await prisma.petProfile.findMany({
      where: {
        NOT: { id: petProfile?.id },
      },
      include: { image: {}, location: {} },
    });

    console.log(petProfile?.image?.publicId);

    return {
      props: {
        petProfile: petProfile,
        petProfiles: petProfiles,
      },
    };
  } catch (error) {
    const petProfile = null;
    const petProfiles = null;
    return {
      props: {
        petProfile: petProfile,
        petProfiles: petProfiles,
      },
    };
  }
}

const Dashboard = ({
  petProfile,
  petProfiles,
}: {
  petProfile: any;
  petProfiles: any;
}) => {
  const { status: sesh, data: data } = useSession();
  const [profile] = useState<PetProfile>(petProfile);
  const [profileView, setProfileView] = useState(false);
  const [matchesView, setMatchesView] = useState(false);
  const [homeView, setHomeView] = useState(false);

  const toggleProfileView = () => {
    profileView ? setProfileView(false) : setProfileView(true);
  };

  const toggleMatchesView = () => {
    matchesView ? setMatchesView(false) : setMatchesView(true);
  };

  const toggleHomeView = () => {
    homeView ? setHomeView(false) : setHomeView(true);
  };

  if (sesh === 'loading') {
    return <div>Loading...</div>;
  } else if (sesh === 'unauthenticated') {
    router.push('/');
  } else if (profile === null || profile === undefined) {
    return <PetProfile petProfile={undefined}></PetProfile>;
  } else if (sesh === 'authenticated' && profile !== null) {
    return (
      <div>
        <div>
          Hi {profile.name}
          {data.user?.email}
        </div>
        <div className="">
          <button
            onClick={() => {
              toggleProfileView();
              setMatchesView(false);
              setHomeView(false);
            }}
          >
            Profile
          </button>{' '}
        </div>
        <div className="">
          <button
            onClick={() => {
              toggleMatchesView();
              setProfileView(false);
              setHomeView(false);
            }}
          >
            Matches
          </button>{' '}
        </div>
        <div className="">
          <button
            onClick={() => {
              toggleHomeView();
              setProfileView(false);
              setMatchesView(false);
            }}
          >
            Home
          </button>{' '}
        </div>
        <div className="">
          <button onClick={() => signOut({ callbackUrl: '/' })}>
            Sign-Out
          </button>
        </div>

        <div className={`${homeView ? '' : 'hidden'}`}>
          <HomeView petProfile={petProfile} petProfiles={petProfiles} />
        </div>
        {/* <div className={`${matchesView ? '' : 'hidden'}`}>
          <MatchesView unis={unis} rsos={rsos} />
        </div> */}

        <div className={`${profileView ? '' : 'hidden'}`}>
          <PetProfile petProfile={petProfile} />
        </div>
      </div>
    );
  }
};

export default Dashboard;
