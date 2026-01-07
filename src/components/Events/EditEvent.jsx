import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export const editEventLoader = ({ params }) => {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000,
  });
};

export const editEventAction = async ({ request, params }) => {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries({ queryKey: ['events'] });

  return redirect('../');
};

export default function EditEvent() {
  const params = useParams();
  const submit = useSubmit();
  const navigate = useNavigate();
  const { state } = useNavigation();

  const { data, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  function handleSubmit(formData) {
    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title={'Failed to load event'}
          message={error.info?.message || 'Failed to fetch event data, please try again later.'}
        />
        <div className='form-actions'>
          <Link to='../' className='button'>
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
