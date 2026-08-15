import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { listarMedicamentos, listarTodasTomadas } from '../db/database';
import { BackupDados } from '../types';

const BACKUP_DIR = FileSystem.documentDirectory + 'backups/';

/**
 * Exporta todos os dados (medicamentos + tomadas) para um arquivo JSON
 * e permite compartilhar via WhatsApp, e-mail, etc.
 */
export async function exportarBackup(): Promise<string | null> {
  try {
    const medicamentos = listarMedicamentos();
    const tomadas = listarTodasTomadas();

    const backup: BackupDados = {
      versao: '1.0',
      dataExportacao: new Date().toISOString(),
      medicamentos,
      tomadas,
    };

    const json = JSON.stringify(backup, null, 2);
    const nomeArquivo = `medalerta-backup-${new Date().toISOString().slice(0, 10)}.json`;

    // Garante que o diretório existe
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }

    const caminho = BACKUP_DIR + nomeArquivo;
    await FileSystem.writeAsStringAsync(caminho, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Compartilha o arquivo
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(caminho, {
        mimeType: 'application/json',
        dialogTitle: 'Compartilhar backup do MedAlerta',
      });
    }

    return caminho;
  } catch (err) {
    console.error('Erro ao exportar backup:', err);
    throw err;
  }
}
