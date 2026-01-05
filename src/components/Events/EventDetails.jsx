import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['event', { id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });
  const {
    mutate,
    isDeleting = isPending,
    isDeleteError = isError,
    deleteError = error
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
  });

  const handleDeleteEvent = () => {
    mutate({ id });
  };

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title={'An error occured!'}
        message={error.info?.message || 'Failed to fetch event data.'}
      />
    );
  }

  if (data) {
    content = (
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          {isDeleting ?
            <p>Deleting event...</p>
            : (
              <nav>
                <button onClick={handleDeleteEvent}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            )
          }
          {isDeleteError && (
            <ErrorBlock
              title={'An error occured!'}
              message={deleteError.info?.message || 'Failed to delete an event.'}
            />
          )}
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content}
    </>
  );
}
