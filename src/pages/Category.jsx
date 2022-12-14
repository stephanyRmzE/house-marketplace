import {useEffect, useState } from 'react'
import {useParams} from 'react-router-dom'
import {collection,
        getDocs,
        query,
        where,
        limit,
        startAfter} from 'firebase/firestore'
import { db } from '../firebase.config'
import {toast} from 'react-toastify';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

function Category() {

  const [listings, setListings] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null)

  const params = useParams();

    useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get reference
        const listingsRef = collection(db, 'listings')

        // Create a query
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          limit(3)
        )

        // Execute query
        const querySnap = await getDocs(q)

        const lastVisible = querySnap.docs[querySnap.docs.length-1]

        setLastFetchedListing(lastVisible)

        const listings = []

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data()
          })
        })
        setLoading(false)
        setListings(listings)

      } catch (error) {
        toast.error('Could not fetch listings')

      }
    }
    fetchListings()
  }, [params.categoryName])


  // Pagination /load more
    const onMoreFetchListings = async () => {
      try {
        // Get reference
        const listingsRef = collection(db, "listings");

        // Create a query
        const q = query(
          listingsRef,
          where("type", "==", params.categoryName),
          limit(3),
          startAfter(lastFetchedListing)
        );

        // Execute query
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length - 1];

        setLastFetchedListing(lastVisible);

        const listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setLoading(false);
        setListings((prevState) => [...prevState, ...listings]);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    };


  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>
          {params.categoryName === "rent"
            ? "Places for rent"
            : "Places for Sale"}
        </p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>

          {lastFetchedListing && (
            <p className="loadMore" onClick={onMoreFetchListings} >Load More</p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
}

export default Category
