import React from 'react';
import { CRXModalDialog } from '@cb/shared';
import DropdownForm from './DropdownForm';
import CategoryForm from './CategoryForm';
import RemoveCategoryForm from './RemoveCategoryForm';
import CancelConfirmForm from './Confirmation/CancelConfirmForm';
import SaveConfirmForm from './Confirmation/SaveConfirmForm';
import EditConfirmForm from './Confirmation/EditConfirmForm';
import { filterCategory } from './Utility/UtilityFunctions';
import { Evidence } from '../../../../utils/Api/models/EvidenceModels';
import { EvidenceAgent } from '../../../../utils/Api/ApiAgent';
import usePrevious from './Utility/usePrev';
import { FormContainerProps } from './Model/FormContainerModel';

const FormContainer: React.FC<FormContainerProps> = React.memo((props) => {
  const [openModal, setOpenModal] = React.useState(false);
  const [showsSticky, setshowSSticky] = React.useState(false);
  const [activeForm, setActiveForm] = React.useState<number>(0);
  const [filterValue, setFilterValue] = React.useState<any>([]);
  const [removedOption, setRemovedOption] = React.useState<any>({});
  const [differenceOfDays, setDifferenceOfDays] = React.useState<number>(0);
  const [modalTitle, setModalTitle] = React.useState('');
  const [removeClassName, setremoveClassName] = React.useState('');
  const [IsformUpdated, setIsformUpdated] = React.useState(false);
  const [removalType, setRemovalType] = React.useState(0);
  const [removeMessage, setRemoveMessage] = React.useState<string>('');
  const [retentionId, setRetentionId] = React.useState<number>(0);
  const [holdUntill, setHoldUntill] = React.useState<string>('');
  const [indicateTxt, setIndicateTxt] = React.useState<boolean>(true);
  const [evidenceResponse, setEvidenceResponse] = React.useState<Evidence>();
  const [previousValueState, setPreviousValueState] = React.useState(0);
  const prevActiveForm = usePrevious(activeForm);

  React.useEffect(() => {
    if (previousValueState !== prevActiveForm) {
      setPreviousValueState(prevActiveForm)
    }
  }, [activeForm]);

  React.useEffect(() => {
    if (props.openForm == true) {
      setOpenModal(true);
      if (props.rowData) {
        const evidenceId = props.rowData.id;
        EvidenceAgent.getEvidence(evidenceId).then((response: Evidence) => {
          setFilterValue(filterCategory(response.categories));
          setEvidenceResponse(response);
        })
          .catch((err: any) => {
            console.error(err);
          });
      }
      setActiveForm(0);
    }
  }, [props.openForm]);

  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    if (IsformUpdated) {
      setActiveForm(2);
      if (activeForm === 2) {
        closeAndResetModal();
      }
      return;
    }

    const newValue = []
      .filter((o: any) => {
        return o.id === removedOption.id;
      })
      .map((i: any) => {
        return {
          id: i.id,
          label: i.name
        };
      })[0];

    if (newValue) {
      setFilterValue((prevState: any) => [...prevState, newValue]); // Set removed option in to State again.
      setRemovedOption({});
    }
    closeAndResetModal();
  }

  const closeAndResetModal = () => {
    setOpenModal(false);
    setActiveForm(0);
    props.setOpenForm();
  }

  const handleActiveForm = (step: number) => {
    switch (step) {
      case 0:
        return (
          <DropdownForm
            activeForm={activeForm}
            setActiveForm={(v: number) => setActiveForm(v)}
            filterValue={filterValue}
            setFilterValue={(v: any) => setFilterValue(v)}
            evidenceResponse={evidenceResponse}
            isCategoryEmpty={props.isCategoryEmpty}
            setremoveClassName={(v: any) => setremoveClassName(v)}
            setOpenForm={() => props.setOpenForm()}
            closeModal={(v: any) => setOpenModal(v)}
            setRemovedOption={(o: any) => setRemovedOption(o)}
            setModalTitle={(i: any) => setModalTitle(i)}
            setIsformUpdated={(e: boolean) => setIsformUpdated(e)}
            setIndicateTxt={(e: any) => setIndicateTxt(e)}
          />
        );
      case 1:
        return (
          <CategoryForm
            activeForm={activeForm}
            setActiveForm={(v: any) => setActiveForm(v)}
            filterValue={filterValue}
            evidenceResponse={evidenceResponse}
            isCategoryEmpty={props.isCategoryEmpty}
            setOpenForm={() => props.setOpenForm()}
            closeModal={(v: any) => setOpenModal(v)}
            setFilterValue={(v: any) => setFilterValue(v)}
            setModalTitle={(i: any) => setModalTitle(i)}
            setremoveClassName={(v: any) => setremoveClassName(v)}
            setIndicateTxt={(e: any) => setIndicateTxt(e)}
            setIsformUpdated={(e: boolean) => setIsformUpdated(e)}
            setshowSSticky={(a: any) => setshowSSticky(a)}
          />
        );
      case 2:
        return (
          <CancelConfirmForm
            setActiveForm={(v: any) => setActiveForm(v)}
            setOpenForm={() => props.setOpenForm()}
            closeModal={(v: any) => setOpenModal(v)}
            setFilterValue={(v: any) => setFilterValue(v)}
            isCategoryEmpty={props.isCategoryEmpty}
            removedOption={removedOption}
            setremoveClassName={(v: any) => setremoveClassName(v)}
            setRemovedOption={(v: any) => setRemovedOption(v)}
            setIsformUpdated={(e: boolean) => setIsformUpdated(e)}
            previousActive={previousValueState}
            setModalTitle={(i: any) => setModalTitle(i)}
            setIndicateTxt={(e: any) => setIndicateTxt(e)}
          />
        );
      case 3:
        return (
          <RemoveCategoryForm
            setActiveForm={(v: any) => setActiveForm(v)}
            setOpenForm={() => props.setOpenForm()}
            closeModal={(v: any) => setOpenModal(v)}
            filterValue={filterValue}
            setFilterValue={(v: any) => setFilterValue(v)}
            setModalTitle={(i: any) => setModalTitle(i)}
            removedOption={removedOption}
            evidenceResponse={evidenceResponse}
            setremoveClassName={(v: any) => setremoveClassName(v)}
            setDifferenceOfDays={(v: number) => setDifferenceOfDays(v)}
            setRemovedOption={(e: any) => setRemovedOption(e)}
            setIsformUpdated={(e: boolean) => setIsformUpdated(e)}
            setRemovalType={(e: number) => setRemovalType(e)}
            setRemoveMessage={(e: string) => setRemoveMessage(e)}
            setRetentionId={(e: number) => setRetentionId(e)}
            setHoldUntill={(e: string) => setHoldUntill(e)}
            setIndicateTxt={(e: any) => setIndicateTxt(e)}
          />
        );
      case 4:
        return (
          <SaveConfirmForm
            setActiveForm={(v: any) => setActiveForm(v)}
            setOpenForm={() => props.setOpenForm()}
            closeModal={(v: any) => setOpenModal(v)}
            setFilterValue={(v: any) => setFilterValue(v)}
            setModalTitle={(i: any) => setModalTitle(i)}
            removedOption={removedOption}
            evidenceResponse={evidenceResponse}
            setremoveClassName={(v: any) => setremoveClassName(v)}
            differenceOfDays={differenceOfDays}
            setRemovedOption={(e: any) => setRemovedOption(e)}
            setIndicateTxt={(e: any) => setIndicateTxt(e)}
            removalType={removalType}
            removeMessage={removeMessage}
            retentionId={retentionId}
            holdUntill={holdUntill}
          />
        );
      case 5:
        return (
          <EditConfirmForm
            setActiveForm={(v: any) => setActiveForm(v)}
            setOpenForm={() => props.setOpenForm()}
            closeModal={(v: any) => setOpenModal(v)}
            evidenceResponse={evidenceResponse}
            filterValue={filterValue}
            setModalTitle={(i: any) => setModalTitle(i)}
            setremoveClassName={(v: any) => setremoveClassName(v)}
            setIsformUpdated={(e: boolean) => setIsformUpdated(e)}
          />
        );
    }
  };

  return (
    <div className='categoryFormContainer'>
      <CRXModalDialog
        maxWidth='lg'
        title={modalTitle}
        className={'CRXModal ' + removeClassName}
        modelOpen={openModal}
        onClose={handleClose}
        defaultButton={false}
        indicatesText={indicateTxt}
        showSticky={showsSticky}
      >
        {handleActiveForm(activeForm)}
      </CRXModalDialog>
    </div>
  );
});

export default FormContainer;
