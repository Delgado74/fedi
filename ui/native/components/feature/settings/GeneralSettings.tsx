import { useNavigation } from '@react-navigation/native'
import { CheckBox, Text, Theme, useTheme } from '@rneui/themed'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, View } from 'react-native'
import { requestNotifications } from 'react-native-permissions'

import { EULA_URL } from '@fedi/common/constants/tos'
import { useNuxStep } from '@fedi/common/hooks/nux'
import {
    selectDeveloperMode,
    selectFederationDiscoveryMethod,
    setFederationDiscoveryMethod,
} from '@fedi/common/redux/environment'
import { FederationDiscoveryMethod } from '@fedi/common/types/fediInternal'
import { isDev, isExperimental } from '@fedi/common/utils/environment'

import { usePinContext } from '../../../state/contexts/PinContext'
import { useAppDispatch, useAppSelector } from '../../../state/hooks'
import { NavigationHook } from '../../../types/navigation'
import { useNotificationsPermission } from '../../../utils/hooks'
import { useLaunchZendesk } from '../../../utils/hooks/support'
import SvgImage from '../../ui/SvgImage'
import SettingsItem from './SettingsItem'

export const GeneralSettings = () => {
    const { theme } = useTheme()
    const { t } = useTranslation()
    const style = styles(theme)
    const navigation = useNavigation<NavigationHook>()
    const { notificationsPermission } = useNotificationsPermission()

    const { launchZendesk } = useLaunchZendesk()

    const developerMode = useAppSelector(selectDeveloperMode)
    const federationDiscoveryMethod = useAppSelector(
        selectFederationDiscoveryMethod,
    )
    const dispatch = useAppDispatch()
    const [hasPerformedPersonalBackup] = useNuxStep(
        'hasPerformedPersonalBackup',
    )
    const { status } = usePinContext()

    const discoveryMethods: FederationDiscoveryMethod[] = [
        'auto',
        'api',
        'nostr',
    ]

    const createOrManagePin = () => {
        if (hasPerformedPersonalBackup && status === 'set') {
            navigation.navigate('PinAccess')
        } else if (hasPerformedPersonalBackup) {
            navigation.navigate('SetPin')
        } else {
            navigation.navigate('CreatePinInstructions')
        }
    }

    const handleNotificationSettings = useCallback(async () => {
        // If not granted, ask for permission
        if (notificationsPermission !== 'granted') {
            // Request Permission
            const { status: notificationsStatus } = await requestNotifications([
                'alert',
                'sound',
            ])

            // Re-check. If not granted, open settings
            if (notificationsStatus !== 'granted') {
                Linking.openSettings()
            }
        } else {
            // If already granted, open settings
            Linking.openSettings()
        }
    }, [notificationsPermission])

    return (
        <View style={style.container}>
            {developerMode && (
                <SettingsItem
                    icon="FediLogoIcon"
                    label={'Developer Settings'}
                    onPress={() => navigation.navigate('DeveloperSettings')}
                />
            )}
            <SettingsItem
                icon="User"
                label={t('phrases.edit-profile')}
                onPress={() => navigation.navigate('EditProfileSettings')}
            />
            <SettingsItem
                icon="Apps"
                label={t('feature.fedimods.fedi-mods')}
                onPress={() =>
                    navigation.navigate('FediModSettings', { type: 'fedi' })
                }
            />
            {/* Feature flag for managing miniapp permissions */}
            {(isDev() || isExperimental()) && (
                <SettingsItem
                    icon="Eye"
                    label={t('feature.settings.mini-app-permission-settings')}
                    onPress={() =>
                        navigation.navigate('MiniAppPermissionSettings')
                    }
                />
            )}
            <SettingsItem
                icon="Language"
                label={t('words.language')}
                onPress={() => navigation.navigate('LanguageSettings')}
            />
            <SettingsItem
                icon="Usd"
                label={t('phrases.display-currency')}
                onPress={() => navigation.navigate('GlobalCurrency')}
            />
            <SettingsItem
                icon="Note"
                label={t('feature.backup.personal-backup')}
                onPress={() => navigation.navigate('RecoveryWords')}
            />
            <SettingsItem
                icon="LockSecurity"
                label={t('feature.pin.pin-access')}
                onPress={createOrManagePin}
            />
            <SettingsItem
                icon="Nostr"
                label={t('feature.nostr.nostr-settings')}
                onPress={() => navigation.navigate('NostrSettings')}
            />
            <SettingsItem
                icon="SmileMessage"
                label={t('feature.support.title')}
                onPress={() => launchZendesk()}
            />
            <SettingsItem
                icon="Settings"
                label={t('feature.settings.app-settings')}
                onPress={() => navigation.navigate('AppSettings')}
            />
            <SettingsItem
                icon="SpeakerPhone"
                label={t('feature.notifications.notification-settings')}
                actionIcon="ExternalLink"
                onPress={handleNotificationSettings}
            />
            <SettingsItem
                icon="Scroll"
                label={t('phrases.fedi-app-terms-of-service')}
                actionIcon="ExternalLink"
                onPress={() => Linking.openURL(EULA_URL)}
            />
            <View style={style.switchLabelContainer}>
                <Text small style={style.switchLabel}>
                    {t('feature.settings.federation-discovery-method')}
                </Text>
            </View>
            {discoveryMethods.map((method, index) => (
                <View key={method}>
                    <CheckBox
                        key={index}
                        checkedIcon={<SvgImage name="RadioSelected" />}
                        uncheckedIcon={<SvgImage name="RadioUnselected" />}
                        title={
                            <Text
                                style={style.checkboxText}
                                numberOfLines={1}>
                                {t(
                                    `feature.settings.federation-discovery-method-${method}`,
                                )}
                            </Text>
                        }
                        checked={method === federationDiscoveryMethod}
                        onPress={() =>
                            dispatch(setFederationDiscoveryMethod(method))
                        }
                        containerStyle={style.checkboxContainer}
                    />
                </View>
            ))}
        </View>
    )
}

const styles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.offWhite100,
            borderRadius: theme.borders.settingsRadius,
            padding: theme.spacing.xs,
        },
        sectionTitle: {
            color: theme.colors.night,
            paddingVertical: theme.spacing.sm,
        },
        switchLabelContainer: {
            maxWidth: '70%',
        },
        switchLabel: {
            textAlign: 'left',
            marginBottom: theme.spacing.xs,
        },
        checkboxContainer: {
            margin: 0,
            paddingHorizontal: 0,
        },
        checkboxText: {
            paddingHorizontal: theme.spacing.md,
            textAlign: 'left',
        },
    })
