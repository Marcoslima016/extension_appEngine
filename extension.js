// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
const fs = require("fs-extra");
const changeCase = require("change-case");


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function getWorkingPathDir(context, activeTextEditor, workspace) {
	if (context) {
		const { fsPath } = context;
		const stats = fs.statSync(context.fsPath);
		return stats.isDirectory() ? fsPath : path.dirname(fsPath);
	} else if (activeTextEditor) {
		return path.dirname(activeTextEditor.document.fileName);
	} else {
		return workspace.rootPath;
	}
}

async function replaceTextInFiles(
	filePath,
	templateName,
	replaceFileTextFn,
	replaceFileNameFn
) {
	try {
		const stat = await fs.stat(filePath);
		if (stat.isDirectory()) {
			const files = await fs.readdir(filePath);
			await Promise.all(
				files.map(async entryFilePath =>
					replaceTextInFiles(
						path.resolve(filePath, entryFilePath),
						templateName,
						replaceFileTextFn,
						replaceFileNameFn
					)
				)
			);
		} else {
			const fileText = (await fs.readFile(filePath)).toString("utf8");
			if (typeof replaceFileTextFn === "function") {
				await fs.writeFile(
					filePath,
					replaceFileTextFn(fileText, templateName, { changeCase, path })
				);

				/**
				 * Rename file
				 * @ref https://github.com/stegano/vscode-template/issues/4
				 */
				if (typeof replaceFileNameFn === "function") {
					const filePathInfo = path.parse(filePath);
					const { base: originalFilename } = filePathInfo;
					const filename = replaceFileNameFn(originalFilename, templateName, {
						changeCase,
						path
					});
					const _filePath = path.resolve(filePathInfo.dir, filename);
					filename && fs.renameSync(filePath, _filePath);
				}
			}
		}
	} catch (e) {
		console.error(e);
	}
}

async function makeTemplateConfigJs(configFilePath) {
	const defaultConfigFile = (
		await fs.readFile(path.resolve(__dirname, "./assets", "template.config.js"))
	).toString("utf8");
	await fs.writeFile(configFilePath, defaultConfigFile);
}

async function makeSampleTemplate(templateRootPath) {
	const defaultSampleTemplatesPath = path.resolve(
		__dirname,
		"./assets/.templates"
	);

	// Make template path and subfolders
	await fs.mkdirs(templateRootPath);
	await fs.copy(defaultSampleTemplatesPath, templateRootPath);
}

async function getDirectories(path) {
	const fs = require('fs');
	return fs.readdirSync(path).filter(function (file) {
		return fs.statSync(path + '/' + file).isDirectory();
	});
}

///[=========================================== CREATE NEW ===========================================]
///[==================================================================================================]
async function createNew(_context, isRenameTemplate) {
	try {
		const workspaceRootPath = vscode.workspace.rootPath;

		const configFilePath = path.resolve(
			workspaceRootPath,
			"template.config.js"
		);
		console.log("configFilePath: " + path.resolve(
			workspaceRootPath,
			"template.config.js"
		));

		var teste = await getDirectories(".");

		console.log("--->" + teste.toString);

		// // If not exist configuration file, make a default configuration file at workspace.
		if (!(await fs.pathExists(configFilePath))) {
			await makeTemplateConfigJs(configFilePath);
		}

		const config = require(configFilePath);



		const templateRootPath = path.resolve(
			workspaceRootPath,
			config.templateRootPath || config.templatePath // deprecated `config.templatePath`
		);
		console.log("templateRootPath: " + path.resolve(
			workspaceRootPath,
			config.templateRootPath || config.templatePath // deprecated `config.templatePath`
		));

		// If not exist `config.templateRootPath`, make `.templates` folder and make sample templates in `.templates`
		if (!(await fs.pathExists(templateRootPath))) {
			await makeSampleTemplate(templateRootPath);
		}

		const workingPathDir = getWorkingPathDir(
			_context,
			vscode.window.activeTextEditor,
			vscode.workspace
		);

		const templatePaths = await fs.readdir(templateRootPath);


		//########################
		const testeDir = await fs.readdir(".");

		const templateRootPath2 = path.resolve(
			workspaceRootPath,
			// deprecated `config.templatePath`
		);

		const dstPath2 = path.resolve(workingPathDir);  /// <<<<<<<<<<<<<<<<<<
		const testeDir2 = await fs.readdir(dstPath2);

		var point = "";

		//########################

		const templateName = await vscode.window.showQuickPick(templatePaths, {
			placeHolder: "Choose a template"
		});

		// If no input data, do nothing
		if (templateName === undefined) {
			return;
		}

		// Copy a template to path
		const srcPath = path.resolve(templateRootPath, templateName);
		console.log("source path: " + path.resolve(templateRootPath, templateName));

		// Input template name from user
		const dstTemplateName = isRenameTemplate
			? await vscode.window.showInputBox({
				prompt: "Input a template name",
				value: templateName
			})
			: templateName;

		const dstPath = path.resolve(workingPathDir, dstTemplateName);
		console.log("dst path: " + path.resolve(workingPathDir, dstTemplateName));


		await fs.copy(srcPath, dstPath);
		replaceTextInFiles(
			dstPath,
			dstTemplateName,
			config.replaceFileTextFn,
			config.replaceFileNameFn
		);
		vscode.window.showInformationMessage("Template: copied!");
	} catch (e) {
		console.error(e.stack);
		vscode.window.showErrorMessage(e.message);
	}
}

///[========================================== createImports =========================================]
///[==================================================================================================]


async function setImports(_context, isRenameTemplate) {
	try {
		const workspaceRootPath = vscode.workspace.rootPath;

		const configFilePath = path.resolve(
			workspaceRootPath,
			"template.config.js"
		);
		const config = require(configFilePath);

		const templateRootPath = path.resolve(
			workspaceRootPath,
			config.templateRootPath || config.templatePath // deprecated `config.templatePath`
		);


		const workingPathDir = getWorkingPathDir(
			_context,
			vscode.window.activeTextEditor,
			vscode.workspace
		);




		//####################################################################

		const dstPath2 = path.resolve(workingPathDir);  /// <<<<<<<<<<<<<<<<<<
		const listaArquivos = await fs.readdir(dstPath2); /// <<<<<<<<<<<<<<<<<<

		var filterFilesArray = [];
		var txtImport = "";


		//------------ GET NOME DA PASTA ------------

		var splitDir = dstPath2.split("/");
		var nomePasta = splitDir.pop();

		//---------------- ARQUIVOS ----------------

		listaArquivos.forEach(function (item, i) {
			var fileSplit = item.split(".");
			if (fileSplit.length <= 1) {
			} else {
				txtImport = txtImport + "export '" + item + "'; \n";
				//adiciona nome do arquivo ao array
				filterFilesArray.push(txtImport);
			}
		});

		//----------------- PASTAS -----------------

		listaArquivos.forEach(function (item, i) {
			var fileSplit = item.split(".");
			if (fileSplit.length <= 1) {
				txtImport = txtImport + "export './" + item + "/" + item + ".imports.dart" + "'; \n";
			}
		});

		//-----------------------------------------

		var testtt = txtImport;


		//####################################################################

		const templateName = "file_imports.dart";

		// Copy a template to path
		const srcPath = path.resolve(templateRootPath, templateName);

		// Input template name from user
		const especialName = await vscode.window.showInputBox({
			prompt: "Se desejar, informe um nome personalizado para o import",
			value: ""
		});

		var dstTemplateName = nomePasta + ".imports" + ".dart";

		if (especialName != "" && especialName != undefined) {
			dstTemplateName = especialName + "_" + nomePasta + ".imports" + ".dart";
		}

		const dstPath = path.resolve(workingPathDir, dstTemplateName);

		await fs.copy(srcPath, dstPath);
		replaceTextInFiles2(
			txtImport,
			dstPath,
			dstTemplateName,
			config.replaceFileTextFn,
			config.replaceFileNameFn
		);

		vscode.window.showInformationMessage("Imports criados!");

	} catch (e) {
		console.error(e.stack);
		vscode.window.showErrorMessage(e.message);
	}
}


async function replaceTextInFiles2(
	newFileTxt,
	filePath,
	templateName,
	replaceFileTextFn,
	replaceFileNameFn
) {
	try {
		const stat = await fs.stat(filePath);
		if (stat.isDirectory()) {
			const files = await fs.readdir(filePath);
			await Promise.all(
				files.map(async entryFilePath =>
					replaceTextInFiles(
						path.resolve(filePath, entryFilePath),
						templateName,
						replaceFileTextFn,
						replaceFileNameFn
					)
				)
			);
		} else {
			const fileText = (await fs.readFile(filePath)).toString("utf8");
			if (typeof replaceFileTextFn === "function") {
				await fs.writeFile(
					filePath,
					replaceFileTextFn(newFileTxt, templateName, { changeCase, path })
				);

				/**
				 * Rename file
				 * @ref https://github.com/stegano/vscode-template/issues/4
				 */
				if (typeof replaceFileNameFn === "function") {
					const filePathInfo = path.parse(filePath);
					const { base: originalFilename } = filePathInfo;
					const filename = replaceFileNameFn(originalFilename, templateName, {
						changeCase,
						path
					});
					const _filePath = path.resolve(filePathInfo.dir, filename);
					filename && fs.renameSync(filePath, _filePath);
				}
			}
		}
	} catch (e) {
		console.error(e);
	}
}



/**
 * @param {vscode.ExtensionContext} context
 */




function activate(context) {
	// This line of code will only be executed once when your extension is activated
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand("extension3.createNew", context =>
			createNew(context, false)
		),
		vscode.commands.registerCommand("extension3.createNewWithRename", context =>
			createNew(context, true)
		),
		vscode.commands.registerCommand("extension3.setImports", context =>
			setImports(context, false)
		),
	);
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
