import { useEffect, useState } from 'react'
import {getAuth, updateProfile} from "firebase/auth"
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc
} from "firebase/firestore";
import {db} from '../firebase.config'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import ListingItem from "../components/ListingItem";

function Profile() {

  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth()
  const [changeDetails, setchangeDetails] = useState(false)

  const[formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
})
  const {name, email} = formData

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, where('userRef', '==', auth.currentUser.uid) );
      const querySnap = await getDocs(q);

      const listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(listings);
      setLoading(false);
    };

    fetchUserListings();
  }, [auth.currentUser.uid]);


  const onLogout = async (e) => {
    auth.signOut()
    navigate('/')

  }

  const onEdit = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const onSubmit = async() => {
    try {
      if (auth.currentUser.displayName !== name) {
        //display name in firebase
        await updateProfile(auth.currentUser,
          {displayName: name})
        //update in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name: name
        })
      }
    } catch (error) {
      console.log(error)
      toast.error('Could not update profile details')
    }
  }

  const onChange = (e) => {
    setFormData((prevState) =>({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      await deleteDoc(doc(db, 'listings', listingId))
      const updatedListings = listings.filter(
        (listing) => listing.id !== listing.id)
      toast.success('Succesfully deleted listing')
      setListings(updatedListings);
    }
  }

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
          LogOut
        </button>
      </header>
      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && onSubmit();
              setchangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? "Done" : "change"}
          </p>
        </div>

          <div className='profileCard'>
            <form>
              <input
                type='text'
                id='name'
                className={!changeDetails ? "profileName" : "profileNameActive"}
                disabled={!changeDetails}
                value={name}
                onChange={onChange}
              />

              <input
                type='text'
                id='email'
                className={!changeDetails ? "profileEmail" : "profileEmailActive"}
                disabled={!changeDetails}
                value={email}
                onChange={onChange}
              />
            </form>
          </div>

          <Link to='/create-listing' className='createListing'>
            <img src={homeIcon} alt='Home' />
            <p>Sell or Rent</p>
            <img src={arrowRight} alt='arrow right' />
          </Link>
    

        {!loading && listings?.length > 0 && (
          <>
            <p className='listingText'> Your Listings</p>
            <ul className='listingsList'>
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile
