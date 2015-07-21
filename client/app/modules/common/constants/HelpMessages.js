/**
 * Created by Maya on 27.3.15.
 */

angular.module('registryApp.common').constant('HelpMessages', {
    cliche: {
        general: {
            environment: 'Docker container information.',
            resources: 'Tool execution resource requirements.',
            command: 'Static part of the command line is described using a list of strings and stdin/stdout redirection.',
            arguments: 'Additional command line arguments, if not bound to any input (e.g. dynamic number of threads).',
            dockerPull: 'Enter image repository and (optionally) tag. For example, "images.sbgenomics.com/jsmith/mytool:latest" \n\n or "ubuntu". We suggest using the SevenBridges image registry (images.sbgenomics.com) to speed up transfer of image data to compute nodes.',
            imageId: 'Optionally set to ID of the image to make sure same image is used every time.',
            cpu: 'Leave at 0 for multi-threaded tools or set 1 for single threaded tools.',
            memory: 'Amount of RAM (in MB) required by the tool.',
            baseCMD: 'Enter name of the executable and (optionally) sub-command and fixed arguments (e.g. “bamtools sort -bS”).',
            addBaseCMD: 'Add base command.',
            successCodes: 'Array of exit codes that signal successful run (defaults to just 0).',
            tempFailCodes: 'Array of retriable exit codes.',
            stdin: 'If a tool can only take input on stdin, set an expression (</>) here to reference the input file \n\n(e.g. $job.inputs.reads.path).',
            stdout: 'Enter file name to redirect standard output into. To construct a name based on inputs, use an expression (</>).',
            addArgument: 'Describe a command line argument that doesn\'t map directly to any of the tool inputs \n\n (e.g. —num-threads should have the "value" field set to "$job.allocatedResources.cpu" expression).'
        },
        inputs: {
            properties: 'Define tool input ports.',
            addInput: 'Add new input port.',
            inputId: 'IDs must be unique for all input and output ports. Value of this port will be available in expressions as $job.inputs["port_id"]. Allowed characters are alphanum and _.',
            type: 'Represents input type.',
            itemType: 'Represents array item type.',
            label: 'Name to show when presenting the input on graphical interfaces.',
            description: 'Help text to show when presenting the input on graphical interfaces.',
            category: 'Category where this input will be grouped under.',
            inputBinding: 'Include this input into command line, and it will show in command line preview bellow.',
            AllowedInputChars: 'Allowed characters are alphanumerics and _'
        },
        outputs: {
            properties: 'Define tool output ports.',
            outputId: 'Unique input id ( required property ).',
            addOutput: 'Add new output port.',
            type: 'Represents output type.',
            itemType: 'Represents array item type. Allowed characters are alphanum and _.',
            glob: 'File(s) matching this glob expression will be reported as output(s) on this port.',
            metadata: 'File metadata is a map of string->string. If value depends on tool inputs, use an expression (</>) \n\n like $job.inputs.reads.meta.sample. more info (link to advanced features -> metadata)',
            secondaryFiles: 'click + to enumerate index files that should accompany this output.',
            secondaryFilesInfo: 'If a tool creates index files, list them here using file naming rules: ".ext" means that ".ext" is appended \n\n to original file name; "^.ext" means ".ext" is appended to file base name (after original extension is removed).'
        },
        // inputBindings and outputBindings
        bindings: {
            position: 'An integer priority of the input on the command line (lower comes first).',
            prefix: 'Prefix for named arguments (e.g. —input-file or -i). If value is not supplied or false, the prefix will not be added. \n\n If value is True, only prefix will be added.',
            separatePrefix: 'Character to use as separator between prefix and value. \n\n "Space" means pass as separate arguments.',
            itemSeparator: 'If specified, cast items to string and pass them as single argument (separated with supplied character).',
            value: 'Enter an expression (</>) to transform the input value before passing it to the command line. \n\n Original value is available as $self variable.'
        },
        metadata: {
            metadata: 'Fill additional information about app.',
            label: 'Application display label.',
            description: 'Application description (markdown works).',
            toolkit: 'Application toolkit name (e.g. "samtools").',
            toolkitVersion: 'Application toolkit version.',
            homepage: 'Application homepage url.',
            categories: 'Categories where application should be listed.'
        },
        test: {
            allocatedResources: '',
            inputs: ''
        },
        script: {
            script: ''
        }
    },
    dyole: {

    },
    main: {

    },
    app: {

    }
});
