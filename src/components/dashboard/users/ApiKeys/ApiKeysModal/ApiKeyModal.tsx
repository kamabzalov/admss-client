import { ApiKeyEnabled, ApiKeyRecord, ApiTypeName, ApiTypes } from "common/interfaces/UserApiKeys";
import { CustomModal } from "components/dashboard/helpers/modal/renderModalHelper";
import { CustomCheckbox } from "components/dashboard/helpers/renderInputsHelper";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { getApiKeysTypes, setUserApiKey } from "../apiKeys.service";
import { PrimaryButton } from "components/dashboard/smallComponents/buttons/PrimaryButton";
import { useParams } from "react-router-dom";
import { Status } from "common/interfaces/ActionStatus";

interface ApiKeyModalProps {
    onClose: () => void;
    apiKey?: Partial<ApiKeyRecord>;
    updateAction?: () => void;
}

const formatDateToInputString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const defaultDate = new Date().getTime();

export const ApiKeyModal = ({ apiKey, onClose, updateAction }: ApiKeyModalProps): JSX.Element => {
    const { id: useruid } = useParams();
    const [apiKeyTypes, setApiKeyTypes] = useState<ApiTypes[] | null>(null);
    const [apiKeyType, setApiKeyType] = useState<ApiTypeName>(
        apiKey?.apitype || ApiTypeName.DEFAULT
    );
    const [apiKeyValue, setApiKeyValue] = useState<string>(apiKey?.apikey || "");
    const [apiKeyIssue, setApiKeyIssue] = useState<number | Date>(apiKey?.issuedate || defaultDate);
    const [apiKeyExpiration, setApiKeyExpiration] = useState<number | Date>(
        apiKey?.expirationdate || defaultDate
    );
    const [apiKeyNotes, setApiKeyNotes] = useState<string>(apiKey?.notes || "");
    const [apiKeyEnabled, setApiKeyEnabled] = useState<ApiKeyEnabled | 0>(apiKey?.enabled || 0);

    const getApiTypes = () => {
        getApiKeysTypes().then((res) => {
            setApiKeyTypes(res.api_types);
            updateAction && updateAction();
        });
    };

    useEffect(() => {
        getApiTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApiKeyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setApiKeyType(e.target.value as ApiTypeName);
    };

    const handleApiKeyEnabledChange = () => {
        setApiKeyEnabled((prevEnabled) => (prevEnabled ? 0 : 1));
    };

    const handleSave = () => {
        setUserApiKey(useruid as string, {
            ...apiKey,
            issuedate: Number(apiKeyIssue),
            expirationdate: Number(apiKeyExpiration),
            enabled: apiKeyEnabled,
            apitype: apiKeyType,
            notes: apiKeyNotes,
            apikey: apiKeyValue,
        }).then((res) => {
            if (res.status === Status.OK) updateAction && updateAction();
        });

        onClose();
    };

    return (
        <CustomModal onClose={onClose} width={800} title={`${apiKey ? "Edit" : "Add"} API key`}>
            <Form.Group className='d-flex flex-column row-gap-4'>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>Created API key</Form.Label>
                    <Form.Control
                        value={apiKey?.created as string}
                        disabled
                        id={apiKey?.created as string}
                        name='Created API key'
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>Deleted API key</Form.Label>
                    <Form.Control
                        value={apiKey?.deleted as string}
                        disabled
                        id={apiKey?.deleted as string}
                        name='Deleted API key'
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>Updated API key</Form.Label>
                    <Form.Control
                        value={apiKey?.updated as string}
                        disabled
                        id={apiKey?.updated as string}
                        name='Updated API key'
                    />
                </Form.Group>
                <div className='d-flex w-100 gap-4'>
                    <Form.Group className='flex-grow-1'>
                        <Form.Label className='form-label mb-0'>Issue date API key</Form.Label>
                        <Form.Control
                            type='date'
                            className='form-control'
                            name='Issue API key'
                            value={formatDateToInputString(new Date(apiKeyIssue))}
                            onChange={({ target }) =>
                                setApiKeyIssue(new Date(target.value).getTime())
                            }
                        />
                    </Form.Group>
                    <Form.Group className='flex-grow-1'>
                        <Form.Label className='form-label mb-0'>Expiration date API key</Form.Label>
                        <Form.Control
                            type='date'
                            className='form-control'
                            name='Expiration API key'
                            value={formatDateToInputString(new Date(apiKeyExpiration))}
                            onChange={({ target }) =>
                                setApiKeyExpiration(new Date(target.value).getTime())
                            }
                        />
                    </Form.Group>
                </div>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>Last used date API key</Form.Label>
                    <Form.Control
                        value={apiKey?.lastused as string}
                        disabled
                        id={apiKey?.lastused as string}
                        name='Last used API key'
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>Flags API key</Form.Label>
                    <Form.Control
                        value={apiKey?.flags as number}
                        disabled
                        id={String(apiKey?.flags)}
                        name='Flags API key'
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label className='form-label mb-0'>API key type</Form.Label>
                    <Form.Select value={apiKeyType} onChange={handleApiKeyTypeChange}>
                        {apiKeyTypes?.map(({ id, name }) => (
                            <option key={String(id)} value={id}>
                                {name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>User uID</Form.Label>
                    <Form.Control
                        value={apiKey?.useruid}
                        disabled
                        id={String(apiKey?.useruid)}
                        name='User uid'
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>Item uID</Form.Label>
                    <Form.Control
                        value={apiKey?.itemuid}
                        disabled
                        id={String(apiKey?.itemuid)}
                        name='Item uid'
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>Api key</Form.Label>
                    <Form.Control
                        as='textarea'
                        value={apiKeyValue}
                        onChange={({ target }) => setApiKeyValue(target.value)}
                        placeholder='Api key value'
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className='form-label mb-0'>Api notes</Form.Label>
                    <Form.Control
                        as='textarea'
                        value={apiKeyNotes}
                        onChange={({ target }) => setApiKeyNotes(target.value)}
                        placeholder='Leave notes here'
                    />
                </Form.Group>
                <CustomCheckbox
                    currentValue={apiKeyEnabled}
                    id={apiKey?.apikey as string}
                    name='API key enabled'
                    title='API key enabled'
                    action={handleApiKeyEnabledChange}
                />

                <div className='mt-12 d-flex justify-content-center align-content-center'>
                    {apiKey ? (
                        <PrimaryButton type='button' buttonClickAction={handleSave}>
                            Save changes
                        </PrimaryButton>
                    ) : (
                        <PrimaryButton type='button' buttonClickAction={handleSave}>
                            Create
                        </PrimaryButton>
                    )}
                </div>
            </Form.Group>
        </CustomModal>
    );
};
