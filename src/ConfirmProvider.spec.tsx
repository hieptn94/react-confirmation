import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { DialogProps } from './types';
import ConfirmContext from './ConfirmContext';
import ConfirmProvider from './ConfirmProvider';

const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  content,
  confirmText,
  cancelText,
}: DialogProps) => (
  <>
    ConfirmDialog-{isOpen ? 'open' : 'closed'}-{title}-{content}-{confirmText}-
    {cancelText}
    <button onClick={onConfirm} data-testid="btn-confirm" />
    <button onClick={onCancel} data-testid="btn-cancel" />
  </>
);

it('should render closed confirm dialog', () => {
  const TestComponent = () => {
    const { confirm } = React.useContext(ConfirmContext);
    return (
      <button
        onClick={() =>
          confirm({
            title: 'title',
            content: 'content',
            confirmText: 'confirmText',
            cancelText: 'cancelText',
          })
        }
      >
        open confirm
      </button>
    );
  };
  render(
    <ConfirmProvider dialog={ConfirmDialog}>
      <TestComponent />
    </ConfirmProvider>
  );

  expect(screen.queryByText(/ConfirmDialog-closed/)).toBeInTheDocument();

  fireEvent.click(screen.getByText(/open confirm/));

  expect(
    screen.queryByText(
      /ConfirmDialog-open-title-content-confirmText-cancelText/
    )
  ).toBeInTheDocument();
});

it('should get user confirmation', async () => {
  const TestComponent = () => {
    const { confirm } = React.useContext(ConfirmContext);
    const [isConfirmed, setConfirmed] = React.useState(false);
    const handleConfirm = async () => {
      const result = await confirm();
      setConfirmed(result);
    };
    return (
      <>
        Test-{isConfirmed ? 'isConfirmed' : 'isNotConfirmed'}
        <button onClick={handleConfirm} data-testid="btn-open-confirm" />
      </>
    );
  };

  render(
    <ConfirmProvider dialog={ConfirmDialog}>
      <TestComponent />
    </ConfirmProvider>
  );

  expect(screen.queryByText(/Test-isNotConfirmed/)).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('btn-open-confirm'));

  expect(screen.queryByText(/ConfirmDialog-open/)).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('btn-confirm'));

  expect(screen.queryByText(/ConfirmDialog-closed/)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/Test-isConfirmed/)).toBeInTheDocument();
  });
});

it('should get user cancellation', async () => {
  const TestComponent = () => {
    const { confirm } = React.useContext(ConfirmContext);
    const [isCancelled, setIsCancelled] = React.useState(false);
    const handleConfirm = async () => {
      const result = await confirm();
      setIsCancelled(!result);
    };
    return (
      <>
        Test-{isCancelled ? 'isCancelled' : 'isNotCancelled'}
        <button onClick={handleConfirm} data-testid="btn-open-confirm" />
      </>
    );
  };

  render(
    <ConfirmProvider dialog={ConfirmDialog}>
      <TestComponent />
    </ConfirmProvider>
  );

  expect(screen.queryByText(/Test-isNotCancelled/)).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('btn-open-confirm'));

  expect(screen.queryByText(/ConfirmDialog-open/)).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('btn-cancel'));

  expect(screen.queryByText(/ConfirmDialog-closed/)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/Test-isCancelled/)).toBeInTheDocument();
  });
});

it('should close component without touching the dialog', async () => {
  const TestComponent = () => {
    const { confirm, close } = React.useContext(ConfirmContext);
    const [closed, setClosed] = React.useState(false);
    const handleConfirm = async () => {
      try {
        await confirm();
      } catch (e) {
        setClosed(true);
      }
    };
    return (
      <>
        TestComponent-{closed && 'closed'}
        <button onClick={handleConfirm}>open confirm</button>
        <button onClick={close}>close confirm</button>
      </>
    );
  };
  render(
    <ConfirmProvider dialog={ConfirmDialog}>
      <TestComponent />
    </ConfirmProvider>
  );

  fireEvent.click(screen.getByText(/open confirm/));

  expect(screen.queryByText(/ConfirmDialog-open/)).toBeInTheDocument();

  fireEvent.click(screen.getByText(/close confirm/));

  expect(screen.queryByText(/ConfirmDialog-closed/)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/TestComponent-closed/)).toBeInTheDocument();
  });
});
