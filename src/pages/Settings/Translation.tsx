import { Component, Show } from 'solid-js';
import styles from './Settings.module.scss';

import { useIntl } from '@cookbook/solid-intl';
import { settings as t, actions as tActions } from '../../translations';
import PageCaption from '../../components/PageCaption/PageCaption';
import { A } from '@solidjs/router';
import ButtonPrimary from '../../components/Buttons/ButtonPrimary';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import { accountStore, updateAccountStore } from '../../stores/accountStore';

const Translation: Component = () => {
  const intl = useIntl();

  const handleSave = (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const provider = formData.get('provider') as 'libretranslate' | 'deepl' | 'google';
    const apiKey = formData.get('apiKey') as string;
    const libreUrl = formData.get('libreUrl') as string;
    const preferredLanguage = formData.get('preferredLanguage') as string;

    updateAccountStore({
      translationProvider: provider,
      translationApiKey: apiKey,
      translationLibreUrl: libreUrl,
      preferredLanguage: preferredLanguage,
    });

    alert('Translation settings saved!');
  };

  return (
    <div>
      <PageCaption title={intl.formatMessage(t.settings.title)} />
      <form onSubmit={handleSave} class={styles.settingsForm}>
        <div class={styles.settingsField}>
          <label>{intl.formatMessage('translation.provider')}</label>
          <Select
            value={accountStore.translationProvider || 'libretranslate'}
            onChange={(e) => {
              // We'll handle the change in the form submission for simplicity
            }}
          >
            <option value="libretranslate">LibreTranslate</option>
            <option value="deepl">DeepL</option>
          </Select>
        </div>

        <div class={styles.settingsField}>
          <label>{intl.formatMessage('translation.apiKey')}</label>
          <Input
            type="password"
            value={accountStore.translationApiKey || ''}
            onChange={(e) => {
              // We'll handle in form submission
            }}
          />
        </div>

        <Show when={(accountStore.translationProvider || 'libretranslate') === 'libretranslate'}>
          <div class={styles.settingsField}>
            <label>{intl.formatMessage('translation.libreUrl')}</label>
            <Input
              type="text"
              value={accountStore.translationLibreUrl || 'https://libretranslate.de'}
              onChange={(e) => {
                // We'll handle in form submission
              }}
            />
          </div>
        </Show>

        <div class={styles.settingsField}>
          <label>{intl.formatMessage('translation.preferredLanguage')}</label>
          <Select
            value={accountStore.preferredLanguage || 'en'}
            onChange={(e) => {
              // We'll handle in form submission
            }}
          >
            <option value="en">English</option>
            <option value="fa">Persian (Farsi)</option>
            <option value="ar">Arabic</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="tr">Turkish</option>
            <option value="ru">Russian</option>
          </Select>
        </div>

        <div class={styles.settingsField}>
          <ButtonPrimary type="submit" value={intl.formatMessage(tActions.save)}>
            {intl.formatMessage(tActions.save)}
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
};

export default Translation;